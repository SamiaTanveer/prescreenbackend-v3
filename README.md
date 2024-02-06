# Project Name

Pre-Screening App

## Project Overview

This application is designed to cater to the needs of both companies and candidates, focusing on enhancing the recruitment process. Access to the platform is restricted to authenticated users, ensuring security and trustworthiness.

Authenticated companies can utilize the platform to create and administer various types of assessments, including Multiple-Choice Questions (MCQs), coding challenges, and more. This versatile approach accommodates a wide range of evaluation methods.

Candidates, on the other hand, are provided with the opportunity to participate in tests offered by different companies. This flexibility empowers candidates to showcase their skills and qualifications across various industries and position

## Getting Started

### Prerequisites

Before diving into the project, developers must ensure that they have the following prerequisites installed on their local machines:

- Node.js: Download and install Node.js from nodejs.org.

- npm (Node Package Manager): npm is bundled with Node.js, so no separate installation is required.

- MongoDB: Install and set up MongoDB on your system. Detailed installation instructions can be found on the official MongoDB website.

### Installation

Follow these detailed steps to install and set up the project on your local machine. This includes cloning the repository, installing dependencies, and configuring essential environment variables.

```bash
# Create nest app
$ npm i -g @nestjs/cli
$ nest new project-name

# Change into the project directory
cd your-project

# Install dependencies
npm install
```

## Features

### JWT Authentication

The application boasts a robust JWT (JSON Web Token) authentication system. This security feature ensures that only authorized users can access the platform.

### Next generation Typescript

Our codebase utilizes the latest TypeScript version, guaranteeing a forward-looking and maintainable codebase that stays up-to-date with the latest language enhancements and features.

### Swagger Api Documentation

For enhanced developer convenience, we've integrated Swagger API documentation. To explore all available API endpoints, simply visit http://localhost:3000/api in your browser. This documentation simplifies the process of understanding and working with our APIs, ensuring a seamless development experience.

## Performed tasks:

- User (candidate or company ) registration.
- User email verification throug Otp.
- User Login.
- Change Password using Otp verifications.
