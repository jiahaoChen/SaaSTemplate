#!/bin/bash
set -e # 任何命令失敗則立即退出

# --- 配置變量 (從外部傳入或在此處定義) ---
GCP_PROJECT_ID="tranquil-buffer-459009-r5"
VM_NAME="mindtube-server"
VM_ZONE="us-central1-a" # 例如 us-central1-a
VM_USER="try" # 例如 root 或你創建的其他用戶 (確保此用戶有權限執行 docker)
APP_DIR_ON_VM="/home/${VM_USER}/code/my-fastapi-app" # 應用程序在 VM 上的路徑 (建議使用用戶 home 目錄)
TRAEFIK_DIR_ON_VM="/home/${VM_USER}/code/traefik-public" # Traefik 配置在 VM 上的路徑

# 你的項目 Git 倉庫 URL (SSH 格式，例如 git@github.com:username/repo.git)
GIT_REPO_URL="git@github.com:jiahaoChen/MindTube.git"
# 要克隆的 Git 分支
GIT_BRANCH="dev" # 或者 "master", 或其他你的主要分支名稱
# 本地 SSH 私鑰文件路徑 (用於克隆私有倉庫)
LOCAL_SSH_PRIVATE_KEY_PATH="~/.ssh/google_compute_engine" # 重要：確保此文件存在且安全

# 或者本地項目源碼路徑 (如果使用 scp，則不需要 GIT_REPO_URL 和 SSH 密鑰)
# LOCAL_APP_CODE_PATH="./" # 相對於此腳本的路徑

# Traefik 環境變量 (應該從安全的地方獲取，例如 CI/CD secrets 或手動輸入)
TRAEFIK_USERNAME="admin"
TRAEFIK_PASSWORD="asdf1234" # 非常重要：不要硬編碼，從安全處獲取
DOMAIN_NAME="mindtube.duckdns.org" # 替換為你的域名
LETSENCRYPT_EMAIL="jiahao.chen99@gmail.com" # 替換為你的 Let's Encrypt 郵箱

# --- 遠程執行命令的輔助函數 ---
# 注意：確保 VM_USER 有權限執行 docker 命令，或者已加入 docker 組
gcloud_ssh() {
    gcloud compute ssh ${VM_USER}@${VM_NAME} --zone ${VM_ZONE} --project ${GCP_PROJECT_ID} --tunnel-through-iap --command="$1" --quiet
}

echo ">>> 1. 準備 Traefik 配置並啟動 Traefik (如果尚未運行)..."
gcloud_ssh "mkdir -p ${TRAEFIK_DIR_ON_VM}"

# 將 docker-compose.traefik.yml 上傳到 VM
# 假設此腳本從項目根目錄執行 (例如 bash ./deploy_gcp/deploy_app_on_vm.sh)
# 並且 docker-compose.traefik.yml 文件位於項目根目錄
TRAEFIK_COMPOSE_LOCAL_PATH="docker-compose.traefik.yml" # 相對於項目根目錄的路徑
if [ -f "${TRAEFIK_COMPOSE_LOCAL_PATH}" ]; then
    gcloud compute scp ${TRAEFIK_COMPOSE_LOCAL_PATH} ${VM_USER}@${VM_NAME}:${TRAEFIK_DIR_ON_VM}/docker-compose.traefik.yml --zone ${VM_ZONE} --project ${GCP_PROJECT_ID} --tunnel-through-iap --quiet
else
    echo "錯誤: 未在項目根目錄找到 '${TRAEFIK_COMPOSE_LOCAL_PATH}' 文件。"
    echo "請確保 docker-compose.traefik.yml 文件位於你執行此腳本的項目根目錄下。"
    exit 1
fi

# 設置 Traefik 環境變量並啟動
# 在本地生成 HASHED_PASSWORD 以避免在遠程 shell 中處理複雜的引用
TRAEFIK_HASHED_PASSWORD=$(openssl passwd -apr1 "${TRAEFIK_PASSWORD}")
if [ -z "${TRAEFIK_HASHED_PASSWORD}" ]; then
    echo "錯誤: 無法生成 HASHED_PASSWORD。請檢查 openssl 是否安裝以及密碼是否提供。"
    exit 1
fi

COMMAND_TO_RUN_TRAEFIK="cd ${TRAEFIK_DIR_ON_VM} && \
sudo USERNAME='${TRAEFIK_USERNAME}' \
HASHED_PASSWORD='${TRAEFIK_HASHED_PASSWORD}' \
DOMAIN='${DOMAIN_NAME}' \
EMAIL='${LETSENCRYPT_EMAIL}' \
docker compose -f docker-compose.traefik.yml up -d"

gcloud_ssh "${COMMAND_TO_RUN_TRAEFIK}"
echo "Traefik 啟動命令已發送。"

echo ">>> 2. 準備應用程序代碼 (使用 SSH 密鑰克隆私有倉庫)..."
# 檢查本地 SSH 私鑰是否存在
if [ ! -f "$(eval echo ${LOCAL_SSH_PRIVATE_KEY_PATH})" ]; then
    echo "錯誤: 本地 SSH 私鑰文件未找到於 ${LOCAL_SSH_PRIVATE_KEY_PATH}"
    echo "請確保已準備好用於部署的 SSH 私鑰，並更新腳本中的 LOCAL_SSH_PRIVATE_KEY_PATH。"
    exit 1
fi

# 在 VM 上創建 .ssh 目錄 (如果不存在) 並設置權限
gcloud_ssh "mkdir -p ~/.ssh && chmod 700 ~/.ssh"

# 將本地 SSH 私鑰安全地複製到 VM
VM_SSH_KEY_PATH="~/.ssh/id_rsa_deploy_gcp_vm_temp"
gcloud compute scp "$(eval echo ${LOCAL_SSH_PRIVATE_KEY_PATH})" ${VM_USER}@${VM_NAME}:${VM_SSH_KEY_PATH} --zone ${VM_ZONE} --project ${GCP_PROJECT_ID} --tunnel-through-iap --quiet
gcloud_ssh "chmod 600 ${VM_SSH_KEY_PATH}"

# 清理舊的應用目錄並使用指定的 SSH 密鑰克隆指定分支的最新代碼
# 同時接受 Git 服務器的主機密鑰 (避免首次連接時的交互提示)
GIT_CLONE_COMMAND="rm -rf ${APP_DIR_ON_VM} && mkdir -p ${APP_DIR_ON_VM} && \
GIT_SSH_COMMAND='ssh -o StrictHostKeyChecking=accept-new -i ${VM_SSH_KEY_PATH}' git clone --branch ${GIT_BRANCH} ${GIT_REPO_URL} ${APP_DIR_ON_VM}"
gcloud_ssh "${GIT_CLONE_COMMAND}"

# （可選但推薦）在克隆完成後從 VM 刪除臨時私鑰
gcloud_ssh "rm -f ${VM_SSH_KEY_PATH}"
echo "應用程序代碼已克隆。"

# 如果你選擇不使用 Git 克隆，而是通過 scp 上傳代碼：
# gcloud_ssh "rm -rf ${APP_DIR_ON_VM} && mkdir -p ${APP_DIR_ON_VM}"
# gcloud compute scp --recurse ${LOCAL_APP_CODE_PATH} ${VM_USER}@${VM_NAME}:${APP_DIR_ON_VM} --zone ${VM_ZONE} --project ${GCP_PROJECT_ID} --tunnel-through-iap --quiet
# echo "應用程序代碼已通過 scp 上傳。"

echo ">>> 3. 配置應用程序 .env 文件..."
# 假設你的 Git 倉庫中包含一個 .env_gcp 文件，用於 GCP 部署
# 腳本將在 VM 上將其重命名為 .env
SETUP_ENV_COMMAND="cd ${APP_DIR_ON_VM} && \
if [ -f .env_gcp ]; then \
    echo '找到 .env_gcp 文件，將其重命名為 .env'; \
    mv .env_gcp .env; \
else \
    echo '警告: 在 ${APP_DIR_ON_VM} 中未找到 .env_gcp 文件。請確保你的倉庫中有此文件，或者手動配置 .env 文件。'; \
fi"
gcloud_ssh "${SETUP_ENV_COMMAND}"
echo "應用程序 .env 文件配置步驟已執行。"
echo "重要：如果 .env_gcp 未找到或需要修改，請在下一步之前手動 SSH 到 VM 進行配置。"
# 你可以在這裡添加一個 read -p "按 Enter 繼續..." 如果需要手動干預的時間

echo ">>> 4. 構建並啟動應用程序服務..."
# 確保 VM 上的用戶有權限訪問 APP_DIR_ON_VM 中的文件，特別是 Dockerfile 和 docker-compose.yml
COMMAND_TO_RUN_APP="cd ${APP_DIR_ON_VM} && \
sudo docker compose -f docker-compose.yml up --build -d"
# --build 會基於本地 Dockerfile 構建鏡像 (例如 backend 和 frontend)
# 已移除 'pull' 命令，以避免因遠端映像不存在或存取問題導致的錯誤，
# 因為主要目的是從本地 Dockerfile 建置。
# 確保 .env 文件中 DOCKER_IMAGE_BACKEND 和 DOCKER_IMAGE_FRONTEND 等變數已正確設置，
# 否則 docker-compose.yml 中的 '${VARIABLE?Variable not set}' 會導致錯誤。
gcloud_ssh "${COMMAND_TO_RUN_APP}"
echo "應用程序啟動命令已發送。"

echo ">>> 部署流程已觸發！"
echo "你可以通過以下命令檢查 Docker 容器狀態:"
echo "gcloud compute ssh ${VM_USER}@${VM_NAME} --zone ${VM_ZONE} --project ${GCP_PROJECT_ID} --command 'sudo docker ps'"
echo "檢查應用程序日誌:"
echo "gcloud compute ssh ${VM_USER}@${VM_NAME} --zone ${VM_ZONE} --project ${GCP_PROJECT_ID} --command 'cd ${APP_DIR_ON_VM} && sudo docker compose logs -f backend'"
