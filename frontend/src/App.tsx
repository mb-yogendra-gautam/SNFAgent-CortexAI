import React, { useState } from "react";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tabs,
  Tab,
  Avatar,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PersonIcon from "@mui/icons-material/Person";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import { Message, ContentItem } from "./types";
import axios from "axios";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const API_URL = "http://localhost:8000";

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: [{ type: "text", text: input }],
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/chat`, {
        messages: [...messages, userMessage],
      });

      const assistantMessage: Message = {
        role: "assistant",
        content: response.data.content,
        request_id: response.data.request_id,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error:", error);
      // Handle error appropriately
    } finally {
      setLoading(false);
    }
  };

  const renderContent = (content: ContentItem[], requestId?: string) => {
    return content.map((item, index) => {
      switch (item.type) {
        case "text":
          return (
            <Typography key={index} paragraph>
              {item.text}
            </Typography>
          );
        case "sql":
          return (
            <Box key={index} sx={{ mb: 2 }}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>SQL Query</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Paper sx={{ p: 2, bgcolor: "#f5f5f5" }}>
                    <pre>{item.statement}</pre>
                  </Paper>
                </AccordionDetails>
              </Accordion>

              {item.results && (
                <Accordion defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Results</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    {item.error ? (
                      <Typography color="error">{item.error}</Typography>
                    ) : (
                      <Box>
                        <Tabs>
                          <Tab label="Data" />
                          <Tab label="Charts" />
                        </Tabs>
                        <Box sx={{ mt: 2 }}>
                          <Paper sx={{ p: 2, overflowX: "auto" }}>
                            <table
                              style={{
                                width: "100%",
                                borderCollapse: "collapse",
                              }}
                            >
                              <thead>
                                <tr>
                                  {Object.keys(item.results[0] || {}).map(
                                    (key) => (
                                      <th
                                        key={key}
                                        style={{
                                          padding: "8px",
                                          borderBottom: "1px solid #ddd",
                                        }}
                                      >
                                        {key}
                                      </th>
                                    )
                                  )}
                                </tr>
                              </thead>
                              <tbody>
                                {item.results.map((row, i) => (
                                  <tr key={i}>
                                    {Object.values(row).map((value, j) => (
                                      <td
                                        key={j}
                                        style={{
                                          padding: "8px",
                                          borderBottom: "1px solid #ddd",
                                        }}
                                      >
                                        {String(value)}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </Paper>
                        </Box>
                      </Box>
                    )}
                  </AccordionDetails>
                </Accordion>
              )}
            </Box>
          );
        case "suggestions":
          return (
            <Box key={index} sx={{ mt: 2 }}>
              <Typography variant="subtitle1">Suggestions:</Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}>
                {item.suggestions?.map((suggestion, i) => (
                  <Button
                    key={i}
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      setInput(suggestion);
                      handleSend();
                    }}
                  >
                    {suggestion}
                  </Button>
                ))}
              </Box>
            </Box>
          );
        default:
          return null;
      }
    });
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Cortex Analyst
      </Typography>

      <Box sx={{ height: "60vh", overflowY: "auto", mb: 2 }}>
        {messages.map((message, index) => (
          <Paper
            key={index}
            sx={{
              p: 2,
              mb: 2,
              bgcolor: message.role === "user" ? "#e3f2fd" : "#f5f5f5",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <Avatar
                sx={{
                  mr: 1,
                  bgcolor:
                    message.role === "user" ? "primary.main" : "secondary.main",
                }}
              >
                {message.role === "user" ? <PersonIcon /> : <SmartToyIcon />}
              </Avatar>
              <Typography variant="subtitle2" color="textSecondary">
                {message.role === "user" ? "You" : "Assistant"}
              </Typography>
            </Box>
            {renderContent(message.content, message.request_id)}
            {message.request_id && (
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="caption">Request ID</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="caption">
                    {message.request_id}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            )}
          </Paper>
        ))}
      </Box>

      <Box sx={{ display: "flex", gap: 1 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="What is your question?"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
          disabled={loading}
        />
        <Button
          variant="contained"
          onClick={handleSend}
          disabled={loading || !input.trim()}
        >
          {loading ? <CircularProgress size={24} /> : "Send"}
        </Button>
      </Box>
    </Container>
  );
}

export default App;
