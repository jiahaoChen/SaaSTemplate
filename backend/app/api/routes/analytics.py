from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from typing import Any
from datetime import datetime, timedelta
import random

from app.api.deps import SessionDep

router = APIRouter(tags=["analytics"])


def generate_fake_analytics_data() -> dict[str, Any]:
    """
    Generate fake analytics data matching the mock structure.
    """
    # Visit data
    visit_data = []
    visit_data2 = []
    begin_day = datetime.now() - timedelta(days=16)
    
    fake_y = [7, 5, 4, 2, 4, 7, 5, 6, 5, 9, 6, 3, 1, 5, 3, 6, 5]
    fake_y2 = [1, 6, 4, 8, 3, 7, 2]
    
    for i, y in enumerate(fake_y):
        date = begin_day + timedelta(days=i)
        visit_data.append({
            "x": date.strftime("%Y-%m-%d"),
            "y": y
        })
    
    for i, y in enumerate(fake_y2):
        date = begin_day + timedelta(days=i)
        visit_data2.append({
            "x": date.strftime("%Y-%m-%d"),
            "y": y
        })
    
    # Sales data
    sales_data = []
    for i in range(12):
        sales_data.append({
            "x": f"{i + 1}月",
            "y": random.randint(200, 1200)
        })
    
    # Search data
    search_data = []
    for i in range(50):
        search_data.append({
            "index": i + 1,
            "keyword": f"搜索关键词-{i}",
            "count": random.randint(0, 1000),
            "range": random.randint(0, 100),
            "status": random.randint(0, 1)
        })
    
    # Sales type data
    sales_type_data = [
        {"x": "家用电器", "y": 4544},
        {"x": "食用酒水", "y": 3321},
        {"x": "个护健康", "y": 3113},
        {"x": "服饰箱包", "y": 2341},
        {"x": "母婴产品", "y": 1231},
        {"x": "其他", "y": 1231},
    ]
    
    sales_type_data_online = [
        {"x": "家用电器", "y": 244},
        {"x": "食用酒水", "y": 321},
        {"x": "个护健康", "y": 311},
        {"x": "服饰箱包", "y": 41},
        {"x": "母婴产品", "y": 121},
        {"x": "其他", "y": 111},
    ]
    
    sales_type_data_offline = [
        {"x": "家用电器", "y": 99},
        {"x": "食用酒水", "y": 188},
        {"x": "个护健康", "y": 344},
        {"x": "服饰箱包", "y": 255},
        {"x": "其他", "y": 65},
    ]
    
    # Offline data
    offline_data = []
    for i in range(10):
        offline_data.append({
            "name": f"Stores {i}",
            "cvr": round(random.random() * 0.9, 1)
        })
    
    # Offline chart data
    offline_chart_data = []
    for i in range(20):
        time = datetime.now() + timedelta(minutes=30*i)
        offline_chart_data.append({
            "date": time.strftime("%H:%M"),
            "type": "客流量",
            "value": random.randint(10, 110)
        })
        offline_chart_data.append({
            "date": time.strftime("%H:%M"),
            "type": "支付笔数",
            "value": random.randint(10, 110)
        })
    
    # Radar data
    radar_origin_data = [
        {"name": "个人", "ref": 10, "koubei": 8, "output": 4, "contribute": 5, "hot": 7},
        {"name": "团队", "ref": 3, "koubei": 9, "output": 6, "contribute": 3, "hot": 1},
        {"name": "部门", "ref": 4, "koubei": 1, "output": 6, "contribute": 5, "hot": 7},
    ]
    
    radar_data = []
    radar_title_map = {
        "ref": "引用",
        "koubei": "口碑", 
        "output": "产量",
        "contribute": "贡献",
        "hot": "热度"
    }
    
    for item in radar_origin_data:
        for key, value in item.items():
            if key != "name":
                radar_data.append({
                    "name": item["name"],
                    "label": radar_title_map[key],
                    "value": value
                })
    
    return {
        "visitData": visit_data,
        "visitData2": visit_data2,
        "salesData": sales_data,
        "searchData": search_data,
        "offlineData": offline_data,
        "offlineChartData": offline_chart_data,
        "salesTypeData": sales_type_data,
        "salesTypeDataOnline": sales_type_data_online,
        "salesTypeDataOffline": sales_type_data_offline,
        "radarData": radar_data,
    }


@router.get("/fake_analysis_chart_data")
def get_fake_analysis_chart_data() -> dict[str, Any]:
    """
    Get fake analysis chart data for dashboard.
    """
    data = generate_fake_analytics_data()
    return {"data": data}


@router.get("/chart_data")
def get_chart_data() -> dict[str, Any]:
    """
    Get chart data for workplace.
    """
    # Generate similar data for workplace
    data = generate_fake_analytics_data()
    return {"data": data}


@router.get("/activities")
def get_activities() -> dict[str, Any]:
    """
    Get activities data for workplace.
    """
    titles = [
        'Alipay', 'Angular', 'Ant Design', 'Ant Design Pro',
        'Bootstrap', 'React', 'Vue', 'Webpack'
    ]
    
    avatars = [
        'https://gw.alipayobjects.com/zos/rmsportal/WdGqmHpayyMjiEhcKoVE.png',
        'https://gw.alipayobjects.com/zos/rmsportal/zOsKZmFRdUtvpqCImOVY.png',
        'https://gw.alipayobjects.com/zos/rmsportal/dURIMkkrRFpPgTuzkwnB.png',
        'https://gw.alipayobjects.com/zos/rmsportal/sfjbOqnsXXJgNCjCzDBL.png',
        'https://gw.alipayobjects.com/zos/rmsportal/siCrBXXhmvTQGWPNLBow.png',
        'https://gw.alipayobjects.com/zos/rmsportal/kZzEzemZyKLKFsojXItE.png',
        'https://gw.alipayobjects.com/zos/rmsportal/ComBAopevLwENQdKWiIn.png',
        'https://gw.alipayobjects.com/zos/rmsportal/nxkuOJlFJuAUhzlMTCEe.png',
    ]
    
    descriptions = [
        '那是一种内在的东西，他们到达不了，也无法触及的',
        '希望是一个好东西，也许是最好的，好东西是不会消亡的',
        '生命就像一盒巧克力，结果往往出人意料',
        '城镇中有那么多的酒馆，她却偏偏走进了我的酒馆',
        '那时候我只会想自己想要什么，从不想自己拥有什么',
    ]
    
    members = [
        '科学搬砖组', '全组都是吴彦祖', '中二少女团', '程序员日常', 
        '高逼格设计天团', '骗你来学计算机'
    ]
    
    activities = []
    for i in range(8):
        activities.append({
            "id": f"xxx{i+1}",
            "title": titles[i % len(titles)],
            "logo": avatars[i % len(avatars)],
            "description": descriptions[i % len(descriptions)],
            "updatedAt": datetime.now().isoformat(),
            "member": members[i % len(members)],
            "href": "",
            "memberLink": "",
        })
    
    return {"data": activities} 