# Dev-Mind-Speed-Game-API
This is a backend API for a math speed game built using "Node.js", where the player solves randomly generated math questions based on difficulty level. The game tracks score, time taken, and stores all data in "MongoDB".

# Technologies Used
- Node.js + Express.js
- MongoDB with Mongoose
- Postman for testing APIs

# Features
- Start a game session with a name and difficulty (1 to 4)
- Generate random math equations (with +, -, *, /)
- Track answers, correctness, and time per question
- Automatically generate a new question after each answer
- End the game to view final score, time, and best performance
- Store all game data in the database

# How to Run
1. Clone the repo:

    git clone https://github.com/NadaKdesat/Dev-Mind-Speed-Game-API.git
    cd dev-mind-speed

2. Install dependencies:

    npm install

3. Create a `.env` file in the root directory and add your MongoDB connection string:

    MONGODB_URI=your_mongodb_atlas_connection_string
    PORT=3000

4. Start the server:

    node index.js


# API Endpoints
- Start Game
    POST /game/start

    Request Body:
    {
    "name": "Nada",
    "difficulty": 2
    }

- Submit Answer
    POST /game/:gameId/submit

    Request Body
    {
    "answer": 45.7
    }

- End Game
    GET /game/:gameId/end
