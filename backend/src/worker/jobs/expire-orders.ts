import { db } from "../../lib/db";
import { expirePendingOrders } from "../../services/order-service";

export async function processExpireOrdersJob(): Promise<number> {
  try {
    const result = await expirePendingOrders();
    if (result.expired > 0) {
      console.log(`[Worker:ExpireOrders] Expired ${result.expired} stale orders.`);
    }
    return result.expired;
  } catch (error) {
    console.error("[Worker:ExpireOrders] Error expiring orders:", error);
    throw error;
  }
}
