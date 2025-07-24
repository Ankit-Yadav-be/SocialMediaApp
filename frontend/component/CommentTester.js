import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import axios from "axios";

const AICommentTester = () => {
  const [comment, setComment] = useState("");
  const [tone, setTone] = useState("");

  const analyzeComment = async () => {
    try {
      const res = await axios.post("https://social-media-app-six-nu.vercel.app/api/ai/analyze-comment", {
        comment,
      });
      setTone(res.data.tone);
    } catch (err) {
      console.error("Analysis failed", err);
      setTone("Error");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>AI Comment Tone Checker</Text>
      <TextInput
        style={styles.input}
        placeholder="Type a comment..."
        value={comment}
        onChangeText={setComment}
      />
      <Button title="Analyze" onPress={analyzeComment} />
      {tone && <Text style={styles.result}>Tone: {tone}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  heading: { fontSize: 20, marginBottom: 10 },
  input: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
  },
  result: {
    marginTop: 20,
    fontSize: 18,
    color: "purple",
    fontWeight: "bold",
  },
});

export default AICommentTester;
