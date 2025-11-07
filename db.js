// db.js
// code for connecting to documentdb
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// const encodedPassword = encodeURIComponent(process.env.DOCDB_PASSWORD);
// const tlsFilePath = '/app/global-bundle.pem'; // path inside container

// const connectDB = async () => {
//   try {
//     const uri = `mongodb://${process.env.DOCDB_USERNAME}:${encodedPassword}@docdb-2025-11-06-17-40-47.cluster-c8dusewu8gw0.us-east-1.docdb.amazonaws.com:27017/admin?tls=true&replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false&authMechanism=SCRAM-SHA-1`;

//     console.log("Connecting to:", uri.replace(encodedPassword, "***")); // never log real password

//     await mongoose.connect(uri, {
//       tlsCAFile: tlsFilePath,
//       serverSelectionTimeoutMS: 10000,
//       tlsAllowInvalidHostnames: true, // optional, useful for DocumentDB hostnames
//     });

//     console.log("✅ Connected to AWS DocumentDB");
//   } catch (error) {
//     console.error("❌ DocumentDB connection failed:", error.message);
//     console.error(error);
//     process.exit(1);
//   }
// };

const connectDB = async () =>{
  mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }).then(() => console.log("MongoDB connected!"))
    .catch((err) => console.log("MongoDB connection error!",err));
}

export default connectDB;
