import React from "react";
import { Page, Text, View, Document, Image, StyleSheet } from "@react-pdf/renderer";

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center'
  },
  logo: {
    width: 100,
    height: 100,
    marginRight: 15
  },
  headerText: {
    flex: 1
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5
  },
  restaurantInfo: {
    marginBottom: 20,
  },
  section: {
    marginBottom: 15,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    paddingTop: 10,
    fontWeight: "bold",
  },
  address: {
    marginTop: 20,
  },
});

const OrderBillPDF = ({ order }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        {/* Add your logo image */}
        <Image 
          style={styles.logo}
          src="../public/logo.png"
        />
        <View style={styles.headerText}>
          <Text style={styles.title}>EatEase</Text>
          <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 5 }}>
            {order.restaurant?.name || "Restaurant"}
          </Text>
          <Text>Order #{order._id.slice(-6).toUpperCase()}</Text>
          <Text>Status: {order.status}</Text>
          <Text>
            Date: {new Date(order.createdAt).toLocaleDateString()} at{" "}
            {new Date(order.createdAt).toLocaleTimeString()}
          </Text>
        </View>
      </View>

      <View style={styles.restaurantInfo}>
        <Text style={{ marginBottom: 5 }}>{order.restaurant?.description}</Text>
        <Text>{order.restaurant?.address?.street}</Text>
        <Text>
          {order.restaurant?.address?.city}, {order.restaurant?.address?.country}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={{ marginBottom: 10, fontWeight: "bold" }}>Order Items</Text>
        {order.items.map((item, index) => (
          <View key={index} style={{ marginBottom: 8 }}>
            <View style={styles.itemRow}>
              <Text>
                {item.quantity} x {item.menuItem?.name}
              </Text>
              <Text>LKR {(item.menuItem?.price * item.quantity).toFixed(2)}</Text>
            </View>
            {item.menuItem?.description && (
              <Text style={{ fontSize: 10, color: "#666" }}>
                {item.menuItem.description}
              </Text>
            )}
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <View style={styles.itemRow}>
          <Text>Subtotal:</Text>
          <Text>LKR {order.totalPrice.toFixed(2)}</Text>
        </View>
        <View style={styles.itemRow}>
          <Text>Delivery Fee:</Text>
          <Text>LKR 150.00</Text>
        </View>
        <View style={styles.totalRow}>
          <Text>Total:</Text>
          <Text>LKR {(order.totalPrice + 150).toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.address}>
        <Text style={{ fontWeight: "bold", marginBottom: 5 }}>Delivery Address</Text>
        <Text>{order.deliveryAddress?.street}</Text>
        <Text>
          {order.deliveryAddress?.city}, {order.deliveryAddress?.country}
        </Text>
        {order.deliveryAddress?.instructions && (
          <Text style={{ marginTop: 5 }}>
            Instructions: {order.deliveryAddress.instructions}
          </Text>
        )}
      </View>
    </Page>
  </Document>
);

export default OrderBillPDF;