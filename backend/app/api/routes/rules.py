from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select, or_, and_
from typing import Any

from app.api.deps import CurrentUser, SessionDep
from app.models import Rule, RuleCreate, RulePublic, RulesPublic

router = APIRouter(tags=["rules"])


@router.get("/rule", response_model=RulesPublic)
def read_rules(
    session: SessionDep,
    current_user: CurrentUser,
    current: int = Query(1, ge=1),
    pageSize: int = Query(10, ge=1, le=100),
    name: str | None = Query(None),
    sorter: str | None = Query(None),
    filter: str | None = Query(None),
) -> RulesPublic:
    """
    Retrieve rules with pagination, filtering, and sorting.
    """
    # Base query
    statement = select(Rule)
    
    # Apply name filter if provided
    if name:
        statement = statement.where(Rule.name.contains(name))
    
    # Apply additional filters if provided
    if filter:
        # Handle filter parsing (JSON string from frontend)
        try:
            import json
            filter_dict = json.loads(filter)
            for key, values in filter_dict.items():
                if hasattr(Rule, key) and values:
                    attr = getattr(Rule, key)
                    statement = statement.where(attr.in_(values))
        except (json.JSONDecodeError, AttributeError):
            pass
    
    # Apply sorting if provided
    if sorter:
        try:
            import json
            sorter_dict = json.loads(sorter)
            for key, direction in sorter_dict.items():
                if hasattr(Rule, key):
                    attr = getattr(Rule, key)
                    if direction == "descend":
                        statement = statement.order_by(attr.desc())
                    else:
                        statement = statement.order_by(attr.asc())
        except (json.JSONDecodeError, AttributeError):
            pass
    
    # Get total count
    count_statement = statement
    total_count = len(session.exec(count_statement).all())
    
    # Apply pagination
    skip = (current - 1) * pageSize
    statement = statement.offset(skip).limit(pageSize)
    
    rules = session.exec(statement).all()
    
    return RulesPublic(
        data=rules,
        count=total_count,
        success=True
    )


@router.post("/rule")
def manage_rule(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    request_data: dict[str, Any],
) -> dict[str, Any]:
    """
    Handle rule operations (create, update, delete) based on method field.
    """
    method = request_data.get("method")
    
    if method == "post":
        # Create new rule
        rule_data = {
            "name": request_data.get("name"),
            "desc": request_data.get("desc"),
            "owner": current_user.full_name or current_user.email,
            "call_no": 0,
            "status": 0,
            "progress": 0,
            "owner_id": current_user.id
        }
        
        rule = Rule(**rule_data)
        session.add(rule)
        session.commit()
        session.refresh(rule)
        
        return rule.model_dump()
    
    elif method == "update":
        # Update existing rule
        rule_key = request_data.get("key")
        rule = session.get(Rule, rule_key)
        
        if not rule:
            raise HTTPException(status_code=404, detail="Rule not found")
        
        if rule.owner_id != current_user.id:
            raise HTTPException(status_code=400, detail="Not enough permissions")
        
        # Update fields
        if "name" in request_data:
            rule.name = request_data["name"]
        if "desc" in request_data:
            rule.desc = request_data["desc"]
        
        session.add(rule)
        session.commit()
        session.refresh(rule)
        
        return rule.model_dump()
    
    elif method == "delete":
        # Delete rules
        keys = request_data.get("key", [])
        if not isinstance(keys, list):
            keys = [keys]
        
        deleted_count = 0
        for key in keys:
            rule = session.get(Rule, key)
            if rule and rule.owner_id == current_user.id:
                session.delete(rule)
                deleted_count += 1
        
        session.commit()
        
        # Return remaining rules
        remaining_rules = session.exec(select(Rule)).all()
        return {
            "list": [rule.model_dump() for rule in remaining_rules],
            "pagination": {
                "total": len(remaining_rules)
            }
        }
    
    else:
        raise HTTPException(status_code=400, detail="Invalid method")


@router.get("/rule/{rule_id}", response_model=RulePublic)
def read_rule(
    rule_id: str,
    session: SessionDep,
    current_user: CurrentUser,
) -> RulePublic:
    """
    Get rule by ID.
    """
    rule = session.get(Rule, rule_id)
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")
    return rule


 