# Project Description

## Card Game Application

This project is a full-stack web application for a multiplayer card game, built with modern web technologies. The application consists of a client-side React application and a server-side Node.js application using Express and Socket.io for real-time communication.

### Client-Side

The client-side application is built using React and Vite for a fast development experience. It includes the following features:

- **User Interface**: A responsive and interactive UI built with React components.
- **Routing**: Client-side routing using React Router for seamless navigation between different pages.
- **State Management**: Local state management using React hooks.
- **Styling**: Tailwind CSS for utility-first styling and PostCSS for processing CSS.
- **Game Logic**: Core game logic implemented in JavaScript, including poker game rules and score management.
- **Multiplayer Support**: Real-time multiplayer functionality using Socket.io to communicate with the server.

### Server-Side

The server-side application is built using Node.js and Express, providing the following features:

- **WebSocket Communication**: Real-time communication with clients using Socket.io.
- **Game State Management**: Server-side management of game state and player interactions.
- **Routing**: Basic routing for API endpoints using Express.

### Project Structure

The project is organized into two main directories: [``client``](command:_github.copilot.openRelativePath?%5B%7B%22scheme%22%3A%22file%22%2C%22authority%22%3A%22%22%2C%22path%22%3A%22%2Fc%3A%2FUsers%2FUser%2FDesktop%2FCode%2Fcard-game%2Fclient%22%2C%22query%22%3A%22%22%2C%22fragment%22%3A%22%22%7D%5D "c:\Users\User\Desktop\Code\card-game\client") and [``server``](command:_github.copilot.openRelativePath?%5B%7B%22scheme%22%3A%22file%22%2C%22authority%22%3A%22%22%2C%22path%22%3A%22%2Fc%3A%2FUsers%2FUser%2FDesktop%2FCode%2Fcard-game%2Fserver%22%2C%22query%22%3A%22%22%2C%22fragment%22%3A%22%22%7D%5D "c:\Users\User\Desktop\Code\card-game\server").

- **Client**: Contains the React application.
  - `src/`: Source code for the React application.
    - `components/`: Reusable React components.
    - `logic/`: Game logic and utility functions.
    - [`pages/`](command:_github.copilot.openSymbolFromReferences?%5B%7B%22%24mid%22%3A1%2C%22path%22%3A%22%2Fc%3A%2FUsers%2FUser%2FDesktop%2FCode%2Fcard-game%2Fclient%2Fsrc%2Fpages%2FUsernameInput.jsx%22%2C%22scheme%22%3A%22file%22%7D%2C%7B%22line%22%3A0%2C%22character%22%3A0%7D%5D "client/src/pages/UsernameInput.jsx"): Page components for different routes.
  - `public/`: Static assets such as images and icons.
  - Configuration files for Vite, Tailwind CSS, and PostCSS.

- **Server**: Contains the Node.js server application.
  - `server.js`: Main server file.
  - Configuration files for dependencies and environment settings.

### Getting Started

To get started with the project, follow these steps:

1. **Install Dependencies**:
   - Navigate to the [``client``](command:_github.copilot.openRelativePath?%5B%7B%22scheme%22%3A%22file%22%2C%22authority%22%3A%22%22%2C%22path%22%3A%22%2Fc%3A%2FUsers%2FUser%2FDesktop%2FCode%2Fcard-game%2Fclient%22%2C%22query%22%3A%22%22%2C%22fragment%22%3A%22%22%7D%5D "c:\Users\User\Desktop\Code\card-game\client") and [``server``](command:_github.copilot.openRelativePath?%5B%7B%22scheme%22%3A%22file%22%2C%22authority%22%3A%22%22%2C%22path%22%3A%22%2Fc%3A%2FUsers%2FUser%2FDesktop%2FCode%2Fcard-game%2Fserver%22%2C%22query%22%3A%22%22%2C%22fragment%22%3A%22%22%7D%5D "c:\Users\User\Desktop\Code\card-game\server") directories and run `npm install` to install the required dependencies.

2. **Run the Development Server**:
   - In the [``client``](command:_github.copilot.openRelativePath?%5B%7B%22scheme%22%3A%22file%22%2C%22authority%22%3A%22%22%2C%22path%22%3A%22%2Fc%3A%2FUsers%2FUser%2FDesktop%2FCode%2Fcard-game%2Fclient%22%2C%22query%22%3A%22%22%2C%22fragment%22%3A%22%22%7D%5D "c:\Users\User\Desktop\Code\card-game\client") directory, run `npm run dev` to start the Vite development server.
   - In the [``server``](command:_github.copilot.openRelativePath?%5B%7B%22scheme%22%3A%22file%22%2C%22authority%22%3A%22%22%2C%22path%22%3A%22%2Fc%3A%2FUsers%2FUser%2FDesktop%2FCode%2Fcard-game%2Fserver%22%2C%22query%22%3A%22%22%2C%22fragment%22%3A%22%22%7D%5D "c:\Users\User\Desktop\Code\card-game\server") directory, run `npm start` to start the Node.js server.

3. **Open the Application**:
   - Open your browser and navigate to the development server URL to access the application.

### Scripts

- **Client**:
  - `npm run dev`: Start the Vite development server.
  - `npm run build`: Build the application for production.
  - `npm run serve`: Preview the production build.

- **Server**:
  - `npm start`: Start the Node.js server.

### Dependencies

- **Client**:
  - React, ReactDOM, React Router DOM, Socket.io-client, Tailwind CSS, PostCSS, Vite.

- **Server**:
  - Express, Socket.io.

This project provides a robust foundation for building a multiplayer card game with real-time communication and a modern web development stack.

[Start Page]
![Starter](https://github.com/user-attachments/assets/f8bf6ba2-08b6-4952-babc-8464e0532d4e)


[Game Mode Selection]
![Game Mode Selection](https://github.com/user-attachments/assets/01c1271f-ad86-4d13-acd8-afd239f3d86c)


[Singleplayer Mode]
![Singleplayer Mode](https://github.com/user-attachments/assets/ac721f12-2410-4b57-b7a9-d3bec9b28e5b)


[Win Animation]
![Win Animation](https://github.com/user-attachments/assets/ebfbb47a-7666-4bcb-a71e-99739684663d)


[Multiplayer Room Creation]
![Room Creation](https://github.com/user-attachments/assets/23820f31-d689-40d5-900f-3381b111ceef)


[Multiplayer Mode]
![Multiplayer Mode](https://github.com/user-attachments/assets/6bd1e03f-bb97-4589-ace5-c0376638c9e7)


[Multiplayer Chat]
![Multiplayer Chat](https://github.com/user-attachments/assets/fd4f7dd8-7bcc-4962-aec4-28f710e5784e)
