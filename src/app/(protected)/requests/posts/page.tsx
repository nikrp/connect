import { columns } from "./columns";
import { RequestsTable } from "./requests-table";

export default function Posts() {

    return (
      <div className={``}>
        <p className={`text-xl font-semibold mb-4`}>My Posts</p>
        <RequestsTable columns={columns} data={[]} />
      </div>
    )
}