import boto3
from rethinkdb import RethinkDB
import os

r = RethinkDB()

conn = r.connect(
    host=os.environ.get("RETHINKDB_HOSTNAME") or "127.0.0.1",
    user=os.environ.get("RETHINKDB_USER") or "admin",
    password=os.environ.get("RETHINKDB_PASSWORD") or "",
    db="magiccap"
)

dynamodb = boto3.resource('dynamodb', region_name="eu-west-2")

table = dynamodb.Table("magiccap_link_shortener")

response = table.scan()

x = 0
for i in response['Items']:
    r.table("shortened_links").insert({
        "id": i['short'],
        "url": i['url']
    }).run(conn)
    x += 1
    print(f"Migrated {i['short']}")

print(f"Migrated {x}")
