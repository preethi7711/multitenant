import asyncio
import asyncpg

async def main():
    try:
        conn = await asyncpg.connect("postgresql://taskuser:taskpassword@localhost:5432/taskdb")
        tables = await conn.fetch("SELECT tablename FROM pg_tables WHERE schemaname='public'")
        print("DB Connected OK. Tables:", [t["tablename"] for t in tables])
        await conn.close()
    except Exception as e:
        print("DB ERROR:", e)

asyncio.run(main())
