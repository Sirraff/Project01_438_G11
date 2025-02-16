// __tests__/Search.test.tsx
import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import Search from "../app/screens/Search"; 
import { FIREBASE_AUTH } from "../FirebaseConfig";

// We'll mock the modules that perform asynchronous work
import * as FruitDatabase from "../app/database/FruitDatabase";
import * as UserDatabase from "../app/database/UserDatabase";

// Mock functions for getProduce and getUserByName
jest.mock("../app/database/FruitDatabase");
jest.mock("../app/database/UserDatabase");

// Also, mock useFocusEffect to simply run the callback immediately
jest.mock("@react-navigation/native", () => ({
  useFocusEffect: (callback: any) => callback(),
}));

// Mock Firebase config so that currentUser is available
jest.mock("../FirebaseConfig", () => ({
  FIREBASE_AUTH: {
    currentUser: { email: "test@example.com" },
  },
  FIRESTORE_DB: {}, // You can add more mocks here if necessary
}));

describe("Search Screen", () => {
  const fakeProduce = [
    {
      id: 1,
      produce_doc: "Apple",
      name_produce: "Apple",
      description: "A juicy apple",
      imageurl: "http://example.com/apple.png",
    },
    {
      id: 2,
      produce_doc: "Banana",
      name_produce: "Banana",
      description: "A ripe banana",
      imageurl: "http://example.com/banana.png",
    },
    {
      id: 3,
      produce_doc: "Cherry",
      name_produce: "Cherry",
      description: "Sweet cherry",
      imageurl: "http://example.com/cherry.png",
    },
  ];

  beforeEach(() => {
    // Reset mocks before each test.
    (FruitDatabase.getProduce as jest.Mock).mockResolvedValue(fakeProduce);
    (UserDatabase.getUserByName as jest.Mock).mockResolvedValue({
      user_id: 1,
      name_user: "test@example.com",
      base_id: "abc123",
      favorites: "Apple,Banana", // User's favorite produce
    });
  });

  it("renders the search screen and filters produce based on search query", async () => {
    const { getByPlaceholderText, getByText, queryByText } = render(<Search />);
    
    // Wait for produce to load
    await waitFor(() => {
      expect(getByText("Apple")).toBeTruthy();
      expect(getByText("Banana")).toBeTruthy();
    });
    
    // Simulate typing "ap" into the search bar:
    const searchInput = getByPlaceholderText("Search produce...");
    fireEvent.changeText(searchInput, "ap");
    
    // Now, "Apple" should appear because it matches, and "Banana" should not
    await waitFor(() => {
      expect(getByText("Apple")).toBeTruthy();
      expect(queryByText("Banana")).toBeNull();
    });
  });
});
