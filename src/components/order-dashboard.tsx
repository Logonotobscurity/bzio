import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const orders = [
  {
    order_id: "ORD-001",
    customer_name: "John Doe",
    order_date: "2023-10-27",
    status: "Shipped",
    total: "₦50,000.00",
  },
  {
    order_id: "ORD-002",
    customer_name: "Jane Smith",
    order_date: "2023-10-26",
    status: "Delivered",
    total: "₦25,000.00",
  },
  {
    order_id: "ORD-003",
    customer_name: "Bob Johnson",
    order_date: "2023-10-25",
    status: "Pending",
    total: "₦75,000.00",
  },
];

export default function OrderDashboard() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order ID</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.order_id}>
            <TableCell className="font-medium">{order.order_id}</TableCell>
            <TableCell>{order.customer_name}</TableCell>
            <TableCell>{order.order_date}</TableCell>
            <TableCell>{order.status}</TableCell>
            <TableCell className="text-right">{order.total}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
