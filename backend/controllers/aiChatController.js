import AIChat from "../models/AIChat.js";

/**
 * Return the logged-in user's saved AI conversation.
 *
 * GET /api/ai/history
 */
export const getChatHistory = async (req, res) => {
  try {
    let chat = await AIChat.findOne({
      user: req.user._id,
    });

    if (!chat) {
      chat = await AIChat.create({
        user: req.user._id,
        role: req.user.role,
        messages: [],
      });
    }

    return res.status(200).json({
      success: true,
      messages: chat.messages,
    });
  } catch (error) {
    console.error("Get AI chat history error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve AI chat history",
    });
  }
};

/**
 * Save one user message and its corresponding AI response.
 *
 * POST /api/ai/history
 *
 * Request body:
 * {
 *   "userMessage": "Summarize my complaints",
 *   "aiMessage": "Here is your complaint summary..."
 * }
 */
export const saveChatMessages = async (req, res) => {
  try {
    const { userMessage, aiMessage } = req.body;

    if (
      typeof userMessage !== "string" ||
      typeof aiMessage !== "string" ||
      !userMessage.trim() ||
      !aiMessage.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "User message and AI message are required",
      });
    }

    const cleanUserMessage = userMessage.trim();
    const cleanAIMessage = aiMessage.trim();

    if (cleanUserMessage.length > 10000 || cleanAIMessage.length > 10000) {
      return res.status(400).json({
        success: false,
        message: "A chat message cannot exceed 10,000 characters",
      });
    }

    const newMessages = [
      {
        sender: "user",
        text: cleanUserMessage,
      },
      {
        sender: "ai",
        text: cleanAIMessage,
      },
    ];

    const chat = await AIChat.findOneAndUpdate(
      {
        user: req.user._id,
      },
      {
        $set: {
          role: req.user.role,
        },
        $push: {
          messages: {
            $each: newMessages,
            $slice: -100,
          },
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    );

    return res.status(201).json({
      success: true,
      message: "AI conversation saved successfully",
      messages: chat.messages,
    });
  } catch (error) {
    console.error("Save AI chat messages error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message:
          Object.values(error.errors)[0]?.message ||
          "Invalid AI chat information",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to save AI conversation",
    });
  }
};

/**
 * Delete the logged-in user's complete AI conversation.
 *
 * DELETE /api/ai/history
 */
export const clearChatHistory = async (req, res) => {
  try {
    await AIChat.findOneAndDelete({
      user: req.user._id,
    });

    return res.status(200).json({
      success: true,
      message: "AI chat history cleared successfully",
      messages: [],
    });
  } catch (error) {
    console.error("Clear AI chat history error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to clear AI chat history",
    });
  }
};
