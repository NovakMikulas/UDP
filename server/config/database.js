import mongoose from "mongoose";

export const dbConfig = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/iotdb",
    );
    console.log(`MongoDB connection successful: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1); //SHUTDOWN APP IN CASE OF ERROR
  }
};
