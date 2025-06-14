#!/bin/bash
set -e # 任何命令失敗則立即退出

# --- 配置變量 (從外部傳入或在此處定義) ---
# 與 deploy_app_on_vm.sh 中的值保持一致
GCP_PROJECT_ID="tranquil-buffer-459009-r5"
VM_NAME="mindtube-server"
VM_ZONE="us-central1-a"
VM_MACHINE_TYPE="e2-medium"
VM_IMAGE_FAMILY="ubuntu-2204-lts" # 或 debian-11
VM_IMAGE_PROJECT="ubuntu-os-cloud" # 或 debian-cloud
VM_DISK_SIZE="20GB"
STATIC_IP_NAME="${VM_NAME}-static-ip"
FIREWALL_RULE_HTTP="allow-http-${VM_NAME}"
FIREWALL_RULE_HTTPS="allow-https-${VM_NAME}"
# SERVICE_ACCOUNT_EMAIL="your-service-account@${GCP_PROJECT_ID}.iam.gserviceaccount.com" # 可選

# --- 登錄 GCP (如果需要, 通常在 CI/CD 環境中會預先配置好認證) ---
# gcloud auth login
# gcloud config set project ${GCP_PROJECT_ID}

echo ">>> 1. 創建靜態外部 IP 地址 (如果不存在)..."
gcloud compute addresses describe ${STATIC_IP_NAME} --project=${GCP_PROJECT_ID} --region=$(echo ${VM_ZONE} | cut -d'-' -f1-2) --quiet || \
  gcloud compute addresses create ${STATIC_IP_NAME} --project=${GCP_PROJECT_ID} --region=$(echo ${VM_ZONE} | cut -d'-' -f1-2) --quiet
STATIC_IP=$(gcloud compute addresses describe ${STATIC_IP_NAME} --project=${GCP_PROJECT_ID} --region=$(echo ${VM_ZONE} | cut -d'-' -f1-2) --format="value(address)")
echo "靜態 IP 地址: ${STATIC_IP}"
echo "請手動將你的域名 DNS A 記錄指向此 IP: ${STATIC_IP}"
# 在自動化腳本中，DNS 配置通常是手動步驟或通過 DNS API 完成
# read -p "DNS 配置完成後按 Enter 繼續..."

echo ">>> 2. 創建防火牆規則 (如果不存在)..."
gcloud compute firewall-rules describe ${FIREWALL_RULE_HTTP} --project=${GCP_PROJECT_ID} --quiet || \
  gcloud compute firewall-rules create ${FIREWALL_RULE_HTTP} \
    --project=${GCP_PROJECT_ID} \
    --direction=INGRESS \
    --priority=1000 \
    --network=default \
    --action=ALLOW \
    --rules=tcp:80 \
    --source-ranges=0.0.0.0/0 \
    --target-tags=${VM_NAME} \
    --description="Allow HTTP traffic to ${VM_NAME}" --quiet

gcloud compute firewall-rules describe ${FIREWALL_RULE_HTTPS} --project=${GCP_PROJECT_ID} --quiet || \
  gcloud compute firewall-rules create ${FIREWALL_RULE_HTTPS} \
    --project=${GCP_PROJECT_ID} \
    --direction=INGRESS \
    --priority=1000 \
    --network=default \
    --action=ALLOW \
    --rules=tcp:443 \
    --source-ranges=0.0.0.0/0 \
    --target-tags=${VM_NAME} \
    --description="Allow HTTPS traffic to ${VM_NAME}" --quiet

echo ">>> 2b. 創建 SSH 防火牆規則 (如果不存在)..."
gcloud compute firewall-rules describe allow-ssh-${VM_NAME} --project=${GCP_PROJECT_ID} --quiet || \
  gcloud compute firewall-rules create allow-ssh-${VM_NAME} \
    --project=${GCP_PROJECT_ID} \
    --direction=INGRESS \
    --priority=1000 \
    --network=default \
    --action=ALLOW \
    --rules=tcp:22 \
    --source-ranges=0.0.0.0/0 \
    --target-tags=${VM_NAME} \
    --description="Allow SSH traffic to ${VM_NAME}" --quiet

echo ">>> 3. 創建 GCP VM 實例 (如果不存在)..."
gcloud compute instances describe ${VM_NAME} --zone=${VM_ZONE} --project=${GCP_PROJECT_ID} --quiet || \
  (
    # 創建暫存啟動腳本檔案
    STARTUP_SCRIPT_PATH="./startup_script_temp.sh"
    cat > ${STARTUP_SCRIPT_PATH} <<'EOF'
#! /bin/bash
        echo ">>> VM 啟動腳本開始..."
        apt-get update && apt-get upgrade -y
        apt-get install -y ca-certificates curl gnupg lsb-release apt-transport-https software-properties-common
        mkdir -p /etc/apt/keyrings
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
        echo \
          "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
          $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
        apt-get update
        apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
        systemctl start docker
        systemctl enable docker
        docker network create traefik-public || echo "網絡 traefik-public 可能已存在。"
        echo ">>> VM 啟動腳本結束。"
EOF

    gcloud compute instances create ${VM_NAME} \
      --project=${GCP_PROJECT_ID} \
      --zone=${VM_ZONE} \
      --machine-type=${VM_MACHINE_TYPE} \
      --image-family=${VM_IMAGE_FAMILY} \
      --image-project=${VM_IMAGE_PROJECT} \
      --boot-disk-size=${VM_DISK_SIZE} \
      --address=${STATIC_IP_NAME} \
      --tags=${VM_NAME} \
      --scopes=https://www.googleapis.com/auth/cloud-platform \
      --metadata-from-file=startup-script=${STARTUP_SCRIPT_PATH} \
      --quiet
      # 注意：移除了可能導致問題的註解行，並確保 --metadata-from-file 前的 --scopes 行有正確的續行符。
      # 如果需要服務帳戶，請取消註解並正確放置：
      # --service-account=${SERVICE_ACCOUNT_EMAIL} \

    # 刪除暫存檔案
    rm ${STARTUP_SCRIPT_PATH}
  )

echo ">>> VM ${VM_NAME} 準備就緒或已存在。如果剛創建，請等待幾分鐘讓啟動腳本執行完畢。"
echo "你可以通過以下命令 SSH 連接到 VM (deploy_app_on_vm.sh 中 VM_USER 為 try):"
echo "gcloud compute ssh root@${VM_NAME} --zone ${VM_ZONE} --project ${GCP_PROJECT_ID}"
