from fastapi import APIRouter,Request
from strawberry.fastapi import GraphQLRouter
from resolvers import Query, Mutation
import strawberry

router = APIRouter()

schema = strawberry.Schema(query=Query, mutation=Mutation)
graphql_app = GraphQLRouter(schema)

router.include_router(graphql_app, prefix="/graphql")


schema = strawberry.Schema(query=Query, mutation=Mutation)


@router.options("/calendar")
@router.post("/calendar")
async def graphql_query(request: Request):
    try:
        data = await request.json()
    except Exception as e :
         return {"error": "Invalid request"}, 400
    response = await schema.execute(data["query"])
    return response

@router.post("/add_event")  # ✅ مسیر مشخص شد
def add_event():
    return {"message": "Event added"}
