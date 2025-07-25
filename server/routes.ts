import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMessageSchema, insertReplySchema, insertAdminSchema, insertUserSchema } from "@shared/schema";
import { z } from "zod";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Authentication routes for users
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Hash password and create user
      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({ username, password: hashedPassword });
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Error registering user:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      const user = await storage.getUserByUsername(username);
      if (!user || !await comparePasswords(password, user.password)) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      if (!user.isActive) {
        return res.status(401).json({ message: "Account is disabled" });
      }
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error logging in user:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Admin authentication routes
  app.post("/api/auth/admin-login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      const admin = await storage.getAdminByUsername(username);
      if (!admin) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Special handling for ZEKE001 - password should be "ZEKE001"
      if (username === "ZEKE001") {
        if (password !== "ZEKE001") {
          return res.status(401).json({ message: "Invalid credentials" });
        }
        if (!admin.isActive) {
          return res.status(401).json({ message: "Account is disabled" });
        }
        const { password: _, ...adminWithoutPassword } = admin;
        return res.json(adminWithoutPassword);
      }
      
      // For other admins, check password
      if (!admin.password || !await comparePasswords(password, admin.password)) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      if (!admin.isActive) {
        return res.status(401).json({ message: "Account is disabled" });
      }
      
      const { password: _, ...adminWithoutPassword } = admin;
      res.json(adminWithoutPassword);
    } catch (error) {
      console.error("Error logging in admin:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Create admin (only for existing admins)
  app.post("/api/admin/create", async (req, res) => {
    try {
      const { username, password, displayName, role } = req.body;
      
      // Check if admin already exists
      const existingAdmin = await storage.getAdminByUsername(username);
      if (existingAdmin) {
        return res.status(400).json({ message: "Admin username already exists" });
      }
      
      // Hash password if provided
      const hashedPassword = password ? await hashPassword(password) : null;
      
      const admin = await storage.createAdmin({
        username,
        password: hashedPassword,
        displayName,
        role: role || "admin",
      });
      
      const { password: _, ...adminWithoutPassword } = admin;
      res.status(201).json(adminWithoutPassword);
    } catch (error) {
      console.error("Error creating admin:", error);
      res.status(500).json({ message: "Failed to create admin" });
    }
  });

  // Get all admins
  app.get("/api/admin/list", async (req, res) => {
    try {
      const admins = await storage.getAllAdmins();
      const adminsWithoutPasswords = admins.map(({ password, ...admin }) => admin);
      res.json(adminsWithoutPasswords);
    } catch (error) {
      console.error("Error fetching admins:", error);
      res.status(500).json({ message: "Failed to fetch admins" });
    }
  });

  // Update admin status
  app.patch("/api/admin/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      
      const admin = await storage.updateAdminStatus(parseInt(id), isActive);
      const { password: _, ...adminWithoutPassword } = admin;
      res.json(adminWithoutPassword);
    } catch (error) {
      console.error("Error updating admin status:", error);
      res.status(500).json({ message: "Failed to update admin status" });
    }
  });

  // Get all public messages
  app.get("/api/messages/public", async (req, res) => {
    try {
      const messages = await storage.getPublicMessages();
      res.json(messages);
    } catch (error) {
      console.error("Error fetching public messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.get("/api/messages/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const message = await storage.getMessageById(parseInt(id));
      if (!message) {
        res.status(404).json({ message: "Message not found" });
        return;
      }
      res.json(message);
    } catch (error) {
      console.error("Error fetching message:", error);
      res.status(500).json({ message: "Failed to fetch message" });
    }
  });

  // Get all private messages (admin only)
  app.get("/api/messages/private", async (req, res) => {
    try {
      const messages = await storage.getPrivateMessages();
      res.json(messages);
    } catch (error) {
      console.error("Error fetching private messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Get messages by category
  app.get("/api/messages/category/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const messages = await storage.getMessagesByCategory(category);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages by category:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Get messages by recipient
  app.get("/api/messages/recipient/:recipient", async (req, res) => {
    try {
      const { recipient } = req.params;
      const messages = await storage.getMessagesByRecipient(recipient);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages by recipient:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Get available recipients
  app.get("/api/recipients", async (req, res) => {
    try {
      const recipients = await storage.getRecipients();
      res.json(recipients);
    } catch (error) {
      console.error("Error fetching recipients:", error);
      res.status(500).json({ message: "Failed to fetch recipients" });
    }
  });

  // Create new message
  app.post("/api/messages", async (req, res) => {
    try {
      const validatedData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(validatedData);
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid message data", errors: error.errors });
        return;
      }
      console.error("Error creating message:", error);
      res.status(500).json({ message: "Failed to create message" });
    }
  });

  // Create new reply
  app.post("/api/replies", async (req, res) => {
    try {
      const validatedData = insertReplySchema.parse(req.body);
      const reply = await storage.createReply(validatedData);
      res.status(201).json(reply);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid reply data", errors: error.errors });
        return;
      }
      console.error("Error creating reply:", error);
      res.status(500).json({ message: "Failed to create reply" });
    }
  });

  app.delete("/api/replies/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteReply(parseInt(id));
      res.json({ message: "Reply deleted successfully" });
    } catch (error) {
      console.error("Error deleting reply:", error);
      res.status(500).json({ message: "Failed to delete reply" });
    }
  });

  app.post("/api/warnings", async (req, res) => {
    try {
      // In a real app, this would send notifications to users
      // For now, we'll just log the warning
      const { replyId, reason } = req.body;
      console.log(`Warning sent for reply ${replyId}: ${reason}`);
      res.json({ message: "Warning sent successfully" });
    } catch (error) {
      console.error("Error sending warning:", error);
      res.status(500).json({ message: "Failed to send warning" });
    }
  });

  // Update message visibility (make private message public)
  app.patch("/api/messages/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { isPublic } = req.body;
      const message = await storage.updateMessageVisibility(parseInt(id), isPublic);
      res.json(message);
    } catch (error) {
      console.error("Error updating message visibility:", error);
      res.status(500).json({ message: "Failed to update message" });
    }
  });

  // Admin management routes
  app.post("/api/admins", async (req, res) => {
    try {
      const validatedData = insertAdminSchema.parse(req.body);
      const admin = await storage.createAdmin(validatedData);
      // Don't return password in response
      const { password, ...adminWithoutPassword } = admin;
      res.status(201).json(adminWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid admin data", errors: error.errors });
        return;
      }
      console.error("Error creating admin:", error);
      res.status(500).json({ message: "Failed to create admin" });
    }
  });

  app.get("/api/admins", async (req, res) => {
    try {
      const admins = await storage.getAllAdmins();
      // Don't return passwords in response
      const adminsWithoutPasswords = admins.map(({ password, ...admin }) => admin);
      res.json(adminsWithoutPasswords);
    } catch (error) {
      console.error("Error fetching admins:", error);
      res.status(500).json({ message: "Failed to fetch admins" });
    }
  });

  app.patch("/api/admins/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      const admin = await storage.updateAdminStatus(parseInt(id), isActive);
      const { password, ...adminWithoutPassword } = admin;
      res.json(adminWithoutPassword);
    } catch (error) {
      console.error("Error updating admin status:", error);
      res.status(500).json({ message: "Failed to update admin status" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const admin = await storage.getAdminByUsername(username);
      
      if (!admin || admin.password !== password || !admin.isActive) {
        res.status(401).json({ message: "Invalid credentials" });
        return;
      }
      
      const { password: _, ...adminWithoutPassword } = admin;
      res.json(adminWithoutPassword);
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
