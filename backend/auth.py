from fastapi import Depends, HTTPException, status, Header
from typing import Optional
from database import get_supabase

async def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authorization header"
        )

    token = authorization.replace("Bearer ", "")
    supabase = get_supabase()

    try:
        user = supabase.auth.get_user(token)
        if not user or not user.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials"
            )
        return user.user
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}"
        )

async def get_user_role(user = Depends(get_current_user)) -> str:
    supabase = get_supabase()
    response = supabase.table("users").select("role").eq("id", user.id).maybeSingle().execute()

    if not response.data:
        return "viewer"

    return response.data.get("role", "viewer")

def require_role(*allowed_roles: str):
    async def role_checker(
        user = Depends(get_current_user),
        role: str = Depends(get_user_role)
    ):
        if role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient permissions. Required roles: {', '.join(allowed_roles)}"
            )
        return user
    return role_checker
