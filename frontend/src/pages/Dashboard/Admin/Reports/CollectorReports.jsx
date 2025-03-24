import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import logo from "../../../../assets/logo.png";

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    marginBottom: 10,
  },
  headerText: {
    fontSize: 20,
    color: "green",
    fontWeight: "bold",
    marginLeft: 10,
  },
  headerTextContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 10,
    color: "#666666",
  },
  section: {
    marginBottom: 20,
    alignItems: "center", // Center the table section
  },
  heading: {
    fontSize: 24,
    marginBottom: 10,
    textAlign: "center",
    color: "#333333",
    textTransform: "uppercase",
  },
  table: {
    width: "80%", // Center the table with reduced width
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderLeftWidth: 1,
    borderColor: "#DEDEDE",
  },
  tableRow: {
    flexDirection: "row",
  },
  tableColHeader: {
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    padding: 8,
    fontSize: 10,
    fontWeight: "bold",
    width: "33.33%",
    textAlign: "center",
    backgroundColor: "#DEDEDE",
  },
  tableCol: {
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderLeftWidth: 1,
    padding: 8,
    fontSize: 8,
    width: "33.33%",
    textAlign: "center",
  },
  logo: {
    width: 100,
    height: 100,
  },
  signatureContainerCenter: {
    marginTop: 40,
    flexDirection: "column",
    alignItems: "center",
  },
  signatureLine: {
    width: 200,
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
    marginTop: 8,
    borderStyle: "dashed",
  },
  signatureText: {
    fontSize: 10,
    color: "#333333",
  },
});

const Footer = () => (
  <Text style={styles.footer}>
    © 2024 www.agripeace.lk copyright all right reserved.
  </Text>
);

const CollectorReport = ({ dataList }) => {
  const reportDateTime = new Date().toLocaleString("en-US", {
    timeZone: "Asia/Colombo",
  });

  return (
    <Document>
      <Page size="Letter" orientation="landscape" style={styles.page}>
        <View style={styles.section}>
          <View style={styles.header}>
            <View style={styles.headerTextContainer}>
              <Image src={logo} style={styles.logo} />
            </View>
            <Text style={styles.headerText}>{reportDateTime}</Text>
          </View>
          <Text style={styles.heading}>Users</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={styles.tableColHeader}>Name</Text>
              <Text style={styles.tableColHeader}>Email</Text>
              <Text style={styles.tableColHeader}>Address</Text>
              <Text style={styles.tableColHeader}>Telephone</Text>
            </View>
            {dataList.map((user, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableCol}>{user.name}</Text>
                <Text style={styles.tableCol}>{user.email}</Text>
                <Text style={styles.tableCol}>{user.address}</Text>
                <Text style={styles.tableCol}>{user.phone}</Text>
              </View>
            ))}
          </View>
        </View>
        <Footer />
      </Page>
    </Document>
  );
};

export default CollectorReport;
