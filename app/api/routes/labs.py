"""
Routes for labs-related endpoints.

GET /labs?lat=&lng=&product= - nearby BIS-recognized labs for a product's
                                test parameters
"""

from typing import Optional

from fastapi import APIRouter, Query

from app.models.schemas import Lab
from app.services.supabase_service import SupabaseService

router = APIRouter()


@router.get("/", response_model=list[Lab])
def find_labs(
    lat: Optional[float] = Query(None),
    lng: Optional[float] = Query(None),
    product: Optional[str] = Query(None, description="Product/test-parameter keyword"),
    radius_km: float = Query(50.0, description="Search radius when lat/lng given"),
    limit: int = Query(20, le=100),
):
    db = SupabaseService()
    return db.find_labs(product_keyword=product, lat=lat, lng=lng, radius_km=radius_km, limit=limit)
