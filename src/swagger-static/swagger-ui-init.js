
window.onload = function() {
  // Build a system
  let url = window.location.search.match(/url=([^&]+)/);
  if (url && url.length > 1) {
    url = decodeURIComponent(url[1]);
  } else {
    url = window.location.origin;
  }
  let options = {
  "swaggerDoc": {
    "openapi": "3.0.0",
    "paths": {
      "/": {
        "get": {
          "operationId": "AppController_getHello",
          "parameters": [],
          "responses": {
            "200": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "string"
                  }
                }
              }
            }
          }
        }
      },
      "/api/companies": {
        "get": {
          "operationId": "CompanyController_getAllCompanies",
          "parameters": [],
          "responses": {
            "200": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "array",
                    "items": {
                      "$ref": "#/components/schemas/Company"
                    }
                  }
                }
              }
            }
          },
          "tags": [
            "Company"
          ]
        }
      },
      "/api/companies/{companyId}": {
        "get": {
          "operationId": "CompanyController_getCompanyById",
          "summary": "Get the company by ID",
          "parameters": [
            {
              "name": "companyId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Returns the Company by id",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/CompanyDto"
                  }
                }
              }
            },
            "404": {
              "description": "Company not found"
            }
          },
          "tags": [
            "Company"
          ]
        }
      },
      "/api/companies/{userId}": {
        "put": {
          "operationId": "CompanyController_updateCompany",
          "parameters": [
            {
              "name": "userId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateCompanyDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "Company"
          ]
        }
      },
      "/api/resend-otp": {
        "post": {
          "operationId": "AuthController_resendOTP",
          "summary": "Resend OTP AGAIN",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/EmailDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Please Check your email for OTP"
            },
            "201": {
              "description": ""
            },
            "400": {
              "description": "Error sending OTP"
            },
            "404": {
              "description": "User not found"
            }
          },
          "tags": [
            "auth"
          ]
        }
      },
      "/api/change-password": {
        "post": {
          "operationId": "AuthController_changePassword",
          "summary": "Change password of a user",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/changePasswordDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Password changed successfully"
            },
            "400": {
              "description": "Password change failed"
            },
            "404": {
              "description": "User not found",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/NotFoundException"
                  }
                }
              }
            }
          },
          "tags": [
            "auth"
          ]
        }
      },
      "/api/checkToken": {
        "get": {
          "operationId": "AuthController_checkToken",
          "summary": "Check if the token is valid",
          "parameters": [
            {
              "name": "authorization",
              "required": true,
              "in": "header",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Token is valid"
            },
            "401": {
              "description": "Token not provided or invalid"
            }
          },
          "tags": [
            "auth"
          ]
        }
      },
      "/api/auth/me": {
        "get": {
          "operationId": "AuthController_getAuthenticatedUser",
          "summary": "Get the authenticated user",
          "parameters": [],
          "responses": {
            "200": {
              "description": "Authenticated user details",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/AuthUserDto"
                  }
                }
              }
            },
            "401": {
              "description": "User not authenticated"
            },
            "404": {
              "description": "User not found"
            }
          },
          "tags": [
            "auth"
          ],
          "security": [
            {
              "JWT-auth": []
            },
            {
              "bearer": []
            }
          ]
        }
      },
      "/api/auth/register-company": {
        "post": {
          "operationId": "AuthController_registerCompany",
          "summary": "Register the COMPANY and creates its Document",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CompanyDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Company registered successfully"
            },
            "400": {
              "description": "Schema Validation Errors",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/BadRequestException"
                  }
                }
              }
            },
            "409": {
              "description": "Company already exists",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ConflictException"
                  }
                }
              }
            }
          },
          "tags": [
            "auth"
          ]
        }
      },
      "/api/auth/register-candidate": {
        "post": {
          "operationId": "AuthController_registerCandidate",
          "summary": "Register the CANDIDATE and creates its Document",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CandidateDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Candidate registered successfully"
            },
            "400": {
              "description": "Schema Validation Errors",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/BadRequestException"
                  }
                }
              }
            },
            "409": {
              "description": "Candidate already registered and verified OR Candidate registration not completed. Resend OTP",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ConflictException"
                  }
                }
              }
            }
          },
          "tags": [
            "auth"
          ]
        }
      },
      "/api/auth/forgetPassword": {
        "post": {
          "operationId": "AuthController_forgetPassword",
          "summary": "Sends the email otp for password reset procedure",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/EmailDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            },
            "404": {
              "description": "Email doesnot exists",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/NotFoundException"
                  }
                }
              }
            }
          },
          "tags": [
            "auth"
          ]
        }
      },
      "/api/auth/login": {
        "post": {
          "operationId": "AuthController_login",
          "summary": "Logins the user",
          "parameters": [
            {
              "name": "rememberMe",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/loginDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "User logged in successfully"
            },
            "201": {
              "description": ""
            },
            "401": {
              "description": "Invalid credentials or email not verified",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/UnauthorizedException"
                  }
                }
              }
            }
          },
          "tags": [
            "auth"
          ]
        }
      },
      "/api/auth/verifyOtp": {
        "post": {
          "operationId": "AuthController_verifyOtp",
          "summary": "Verfies the OTP sent to email address",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/OtpDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Account Verfication Complete"
            },
            "201": {
              "description": ""
            },
            "400": {
              "description": "Email not found, OTP expired, or wrong OTP"
            }
          },
          "tags": [
            "auth"
          ]
        }
      },
      "/api/auth/google": {
        "get": {
          "operationId": "AuthController_googleAuth",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            },
            "201": {
              "description": "Login user through google."
            }
          },
          "tags": [
            "auth"
          ]
        }
      },
      "/api/auth/google/redirect": {
        "get": {
          "operationId": "AuthController_googleAuthRedirect",
          "parameters": [],
          "responses": {
            "200": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object"
                  }
                }
              }
            },
            "201": {
              "description": "redirect google authorisation."
            }
          },
          "tags": [
            "auth"
          ]
        }
      },
      "/api/users": {
        "post": {
          "operationId": "UserController_userLogin",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateUserDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/User"
                  }
                }
              }
            }
          }
        }
      },
      "/api/users/{id}": {
        "get": {
          "operationId": "UserController_getUserById",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/User"
                  }
                }
              }
            }
          }
        },
        "put": {
          "operationId": "UserController_updateUser",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateUserDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/User"
                  }
                }
              }
            }
          }
        }
      },
      "/api/users/email/{email}": {
        "get": {
          "operationId": "UserController_GetUserByEmail",
          "parameters": [
            {
              "name": "email",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/message"
                  }
                }
              }
            }
          }
        }
      },
      "/api/candidates": {
        "get": {
          "operationId": "CandidateController_getAllCandidates",
          "parameters": [],
          "responses": {
            "200": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "array",
                    "items": {
                      "$ref": "#/components/schemas/Candidate"
                    }
                  }
                }
              }
            }
          },
          "tags": [
            "Candidates"
          ]
        }
      },
      "/api/candidates/{id}": {
        "get": {
          "operationId": "CandidateController_getCandidateById",
          "summary": "Get the candidate by ID",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Returns the Candidate by id",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/CandidateObj"
                  }
                }
              }
            },
            "404": {
              "description": "Candidate not found"
            }
          },
          "tags": [
            "Candidates"
          ]
        },
        "put": {
          "operationId": "CandidateController_updateCandidate",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateCandidateDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "Candidates"
          ]
        }
      },
      "/mailing/send-mail": {
        "get": {
          "operationId": "MailingController_sendMail",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          }
        }
      },
      "/api/randomQ": {
        "post": {
          "operationId": "CodingQuestionsController_getRandomQ",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "tags": {
                      "type": "array",
                      "items": {
                        "type": "string"
                      }
                    },
                    "language": {
                      "type": "string"
                    },
                    "size": {
                      "type": "array",
                      "items": {
                        "type": "number"
                      }
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "array",
                    "items": {
                      "type": "object"
                    }
                  }
                }
              }
            }
          },
          "tags": [
            "Coding Questions"
          ],
          "security": [
            {
              "JWT-auth": []
            },
            {
              "bearer": []
            }
          ]
        }
      },
      "/api/create-mcqs": {
        "post": {
          "operationId": "McqController_create",
          "summary": "Create MCQS",
          "description": "Provide array of MCQs",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateMcqDtoArray"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Mcqs Created Successfully"
            }
          },
          "tags": [
            "MCQ API"
          ],
          "security": [
            {
              "JWT-auth": []
            },
            {
              "bearer": []
            }
          ]
        }
      },
      "/api/mcq-questions": {
        "get": {
          "operationId": "McqController_findAll",
          "summary": "Get all MCQS of company",
          "description": "Returns all mcqs of a company",
          "parameters": [
            {
              "name": "page",
              "required": true,
              "in": "query",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "limit",
              "required": true,
              "in": "query",
              "schema": {
                "type": "number"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "array",
                    "items": {
                      "$ref": "#/components/schemas/CreateMCQDto"
                    }
                  }
                }
              }
            }
          },
          "tags": [
            "MCQ API"
          ],
          "security": [
            {
              "JWT-auth": []
            }
          ]
        }
      },
      "/api/mcq-questions/{id}": {
        "get": {
          "operationId": "McqController_findOne",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/CreateMCQDto"
                  }
                }
              }
            }
          },
          "tags": [
            "MCQ API"
          ],
          "security": [
            {
              "JWT-auth": []
            },
            {
              "bearer": []
            }
          ]
        },
        "put": {
          "operationId": "McqController_update",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateMcqDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/CreateMCQDto"
                  }
                }
              }
            }
          },
          "tags": [
            "MCQ API"
          ],
          "security": [
            {
              "JWT-auth": []
            },
            {
              "bearer": []
            }
          ]
        },
        "delete": {
          "operationId": "McqController_remove",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "MCQ API"
          ],
          "security": [
            {
              "JWT-auth": []
            },
            {
              "bearer": []
            }
          ]
        }
      },
      "/api/mcq-questionsByDifficulty": {
        "post": {
          "operationId": "McqController_getQuestionByDifficulty",
          "summary": "Get Mcqs By Difficulty",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "tags": {
                      "type": "array",
                      "items": {
                        "type": "string"
                      }
                    },
                    "language": {
                      "type": "string"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Returns MCQS",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "easy": {
                        "type": "object",
                        "properties": {
                          "count": {
                            "type": "number"
                          }
                        }
                      },
                      "medium": {
                        "type": "object",
                        "properties": {
                          "count": {
                            "type": "number"
                          }
                        }
                      },
                      "hard": {
                        "type": "object",
                        "properties": {
                          "count": {
                            "type": "number"
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "201": {
              "description": ""
            },
            "404": {
              "description": "MCQS not found"
            }
          },
          "tags": [
            "MCQ API"
          ],
          "security": [
            {
              "JWT-auth": []
            },
            {
              "bearer": []
            }
          ]
        }
      },
      "/api/coding-questions": {
        "post": {
          "operationId": "CodingQuestionsController_createQuestion",
          "summary": "Create a Coding Question",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CodingQuestionDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Created Coding Question",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/CodingQuestionDto"
                  }
                }
              }
            }
          },
          "tags": [
            "Coding Questions"
          ],
          "security": [
            {
              "JWT-auth": []
            },
            {
              "bearer": []
            }
          ]
        },
        "get": {
          "operationId": "CodingQuestionsController_getAllQuestions",
          "summary": "Get all coding questions of a company",
          "parameters": [
            {
              "name": "page",
              "required": true,
              "in": "query",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "limit",
              "required": true,
              "in": "query",
              "schema": {
                "type": "number"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Returns all Coding Questions",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "array",
                    "items": {
                      "$ref": "#/components/schemas/CodingQuestionDto"
                    }
                  }
                }
              }
            },
            "404": {
              "description": "Coding Questions not found"
            }
          },
          "tags": [
            "Coding Questions"
          ],
          "security": [
            {
              "JWT-auth": []
            },
            {
              "bearer": []
            }
          ]
        }
      },
      "/api/coding-questions/{id}": {
        "get": {
          "operationId": "CodingQuestionsController_getQuestionById",
          "summary": "Get coding question By ID",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Returns a Coding Question",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/CodingQuestionDto"
                  }
                }
              }
            },
            "404": {
              "description": "Coding Question not found"
            }
          },
          "tags": [
            "Coding Questions"
          ],
          "security": [
            {
              "JWT-auth": []
            },
            {
              "bearer": []
            }
          ]
        },
        "put": {
          "operationId": "CodingQuestionsController_updateQuestion",
          "summary": "Edits the Codiing Question",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateCodingQuestionDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Returns an edited Coding Question",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/CodingQuestionDto"
                  }
                }
              }
            }
          },
          "tags": [
            "Coding Questions"
          ],
          "security": [
            {
              "JWT-auth": []
            },
            {
              "bearer": []
            }
          ]
        },
        "delete": {
          "operationId": "CodingQuestionsController_deleteQuestion",
          "summary": "Deletes a Coding Question by its id",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "Coding Questions"
          ],
          "security": [
            {
              "JWT-auth": []
            },
            {
              "bearer": []
            }
          ]
        }
      },
      "/api/coding-questionsByDifficulty": {
        "post": {
          "operationId": "CodingQuestionsController_getQuestionByDifficulty",
          "summary": "Get coding question By Difficulty",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "tags": {
                      "type": "array",
                      "items": {
                        "type": "string"
                      }
                    },
                    "language": {
                      "type": "string"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Returns Coding Questions",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "easy": {
                        "type": "object",
                        "properties": {
                          "count": {
                            "type": "number"
                          }
                        }
                      },
                      "medium": {
                        "type": "object",
                        "properties": {
                          "count": {
                            "type": "number"
                          }
                        }
                      },
                      "hard": {
                        "type": "object",
                        "properties": {
                          "count": {
                            "type": "number"
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "201": {
              "description": ""
            },
            "404": {
              "description": "questions not found"
            }
          },
          "tags": [
            "Coding Questions"
          ],
          "security": [
            {
              "JWT-auth": []
            },
            {
              "bearer": []
            }
          ]
        }
      },
      "/api/create-tag": {
        "post": {
          "operationId": "TagController_create",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateTagDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object"
                  }
                }
              }
            }
          },
          "tags": [
            "Tags"
          ],
          "security": [
            {
              "JWT-auth": []
            },
            {
              "bearer": []
            }
          ]
        }
      },
      "/api/getTags": {
        "get": {
          "operationId": "TagController_findAll",
          "summary": "",
          "description": "Get all tags",
          "parameters": [],
          "responses": {
            "200": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "array",
                    "items": {
                      "$ref": "#/components/schemas/CreateTagDto"
                    }
                  }
                }
              }
            }
          },
          "tags": [
            "Tags"
          ],
          "security": [
            {
              "JWT-auth": []
            },
            {
              "bearer": []
            }
          ]
        }
      },
      "/api/getTag/{id}": {
        "get": {
          "operationId": "TagController_findOne",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object"
                  }
                }
              }
            }
          },
          "tags": [
            "Tags"
          ],
          "security": [
            {
              "JWT-auth": []
            }
          ]
        }
      },
      "/api/updateTag/{id}": {
        "patch": {
          "operationId": "TagController_update",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateTagDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "Tags"
          ]
        }
      },
      "/api/deleteTag/{id}": {
        "delete": {
          "operationId": "TagController_remove",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "Tags"
          ]
        }
      },
      "/api/file/upload": {
        "post": {
          "operationId": "UploadController_upload",
          "summary": "Upload a single file",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "multipart/form-data": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "file": {
                      "type": "string",
                      "format": "binary"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            },
            "default": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "url": {
                        "type": "string"
                      },
                      "originalname": {
                        "type": "string"
                      },
                      "path": {
                        "type": "string"
                      }
                    }
                  }
                }
              }
            }
          },
          "tags": [
            "upload files"
          ],
          "security": [
            {
              "JWT-auth": []
            },
            {
              "bearer": []
            }
          ]
        }
      },
      "/api/file/uploads": {
        "post": {
          "operationId": "UploadController_uploads",
          "summary": "Upload multiple files",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "multipart/form-data": {
                "schema": {
                  "type": "array",
                  "properties": {
                    "files": {
                      "type": "array",
                      "items": {
                        "type": "string",
                        "format": "binary"
                      }
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          },
          "tags": [
            "upload files"
          ]
        }
      },
      "/api/file/{path}": {
        "delete": {
          "operationId": "UploadController_remove",
          "parameters": [
            {
              "name": "path",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "upload files"
          ]
        }
      },
      "/candidate-application": {
        "post": {
          "operationId": "CandidateApplicationController_create",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CandidateApplicationDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          }
        },
        "get": {
          "operationId": "CandidateApplicationController_findAll",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          }
        }
      },
      "/candidate-application/{id}": {
        "get": {
          "operationId": "CandidateApplicationController_findOne",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object"
                  }
                }
              }
            }
          }
        },
        "patch": {
          "operationId": "CandidateApplicationController_update",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateCandidateApplicationDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object"
                  }
                }
              }
            }
          }
        },
        "delete": {
          "operationId": "CandidateApplicationController_remove",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          }
        }
      },
      "/api/create-exam": {
        "post": {
          "operationId": "ExamController_create",
          "summary": "Creates an Exam",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateExamDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Created Exam",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/CreateExamDto"
                  }
                }
              }
            }
          },
          "tags": [
            "Exam"
          ],
          "security": [
            {
              "JWT-auth": []
            },
            {
              "bearer": []
            }
          ]
        }
      },
      "/api/exams": {
        "get": {
          "operationId": "ExamController_findAll",
          "summary": "",
          "description": "Get all Exams of all companies",
          "parameters": [],
          "responses": {
            "200": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "array",
                    "items": {
                      "$ref": "#/components/schemas/ExamDto"
                    }
                  }
                }
              }
            }
          },
          "tags": [
            "Exam"
          ],
          "security": [
            {
              "JWT-auth": []
            },
            {
              "bearer": []
            }
          ]
        }
      },
      "/api/examsByCompany": {
        "get": {
          "operationId": "ExamController_findExamsByCompany",
          "summary": "",
          "description": "Get all Exams of a particular company",
          "parameters": [],
          "responses": {
            "200": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "array",
                    "items": {
                      "$ref": "#/components/schemas/ExamDto"
                    }
                  }
                }
              }
            }
          },
          "tags": [
            "Exam"
          ],
          "security": [
            {
              "JWT-auth": []
            },
            {
              "bearer": []
            }
          ]
        }
      },
      "/api/exams/{examId}": {
        "get": {
          "operationId": "ExamController_findOne",
          "summary": "Get Exam By ID",
          "parameters": [
            {
              "name": "examId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Returns an Exam",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ExamDto"
                  }
                }
              }
            }
          },
          "tags": [
            "Exam"
          ],
          "security": [
            {
              "JWT-auth": []
            },
            {
              "bearer": []
            }
          ]
        }
      },
      "/api/exams/{id}": {
        "put": {
          "operationId": "ExamController_update",
          "summary": "Edits the Exam",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateExamDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Returns an edited Exam",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ExamDto"
                  }
                }
              }
            }
          },
          "tags": [
            "Exam"
          ],
          "security": [
            {
              "JWT-auth": []
            },
            {
              "bearer": []
            }
          ]
        },
        "delete": {
          "operationId": "ExamController_remove",
          "summary": "Deletes an Exam by its id",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "Exam"
          ],
          "security": [
            {
              "JWT-auth": []
            },
            {
              "bearer": []
            }
          ]
        }
      },
      "/api/create-candidate-assessment": {
        "post": {
          "operationId": "CandidateAssessmentController_createCandidateAssessment",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateCandidateAssessmentDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ExamMcqQuestion"
                  }
                }
              }
            },
            "201": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object"
                  }
                }
              }
            }
          },
          "tags": [
            "Candidate Assessment"
          ],
          "security": [
            {
              "JWT-auth": []
            },
            {
              "bearer": []
            }
          ]
        }
      },
      "/api": {
        "get": {
          "operationId": "CandidateAssessmentController_findAll",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "Candidate Assessment"
          ],
          "security": [
            {
              "JWT-auth": []
            },
            {
              "bearer": []
            }
          ]
        }
      },
      "/api/getAssessments/{examId}": {
        "get": {
          "operationId": "CandidateAssessmentController_getAssessmentsByExamId",
          "parameters": [
            {
              "name": "examId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "array",
                    "items": {
                      "$ref": "#/components/schemas/CandidateAssessment"
                    }
                  }
                }
              }
            }
          },
          "tags": [
            "Candidate Assessment"
          ],
          "security": [
            {
              "JWT-auth": []
            },
            {
              "bearer": []
            }
          ]
        }
      },
      "/api/getResult": {
        "get": {
          "operationId": "CandidateAssessmentController_fin",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "Candidate Assessment"
          ],
          "security": [
            {
              "JWT-auth": []
            },
            {
              "bearer": []
            }
          ]
        }
      },
      "/api/{id}": {
        "get": {
          "operationId": "CandidateAssessmentController_findOne",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "Candidate Assessment"
          ],
          "security": [
            {
              "JWT-auth": []
            },
            {
              "bearer": []
            }
          ]
        },
        "delete": {
          "operationId": "CandidateAssessmentController_remove",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "Candidate Assessment"
          ],
          "security": [
            {
              "JWT-auth": []
            },
            {
              "bearer": []
            }
          ]
        }
      },
      "/api/candidate-assessment/{examid}": {
        "patch": {
          "operationId": "CandidateAssessmentController_update",
          "parameters": [
            {
              "name": "examid",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateCandidateAssessmentDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "anyOf": [
                      {
                        "$ref": "#/components/schemas/AssessmentCodingObj"
                      },
                      {
                        "$ref": "#/components/schemas/AssessmentMcqObj"
                      }
                    ]
                  }
                }
              }
            }
          },
          "tags": [
            "Candidate Assessment"
          ],
          "security": [
            {
              "JWT-auth": []
            },
            {
              "bearer": []
            }
          ]
        }
      }
    },
    "info": {
      "title": "pre-screen-api",
      "description": "PreScreenApi is an api containing all routes for the app",
      "version": "1.0",
      "contact": {}
    },
    "tags": [],
    "servers": [],
    "components": {
      "securitySchemes": {
        "JWT-auth": {
          "scheme": "bearer",
          "bearerFormat": "JWT",
          "type": "http",
          "name": "JWT",
          "description": "Enter JWT token",
          "in": "header"
        }
      },
      "schemas": {
        "User": {
          "type": "object",
          "properties": {}
        },
        "Company": {
          "type": "object",
          "properties": {
            "logo": {
              "type": "object",
              "properties": {
                "url": {
                  "required": true,
                  "type": "string"
                },
                "path": {
                  "required": true,
                  "type": "string"
                },
                "originalname": {
                  "required": true,
                  "type": "string"
                }
              }
            },
            "name": {
              "type": "string"
            },
            "email": {
              "type": "string"
            },
            "industry": {
              "type": "string"
            },
            "phone": {
              "type": "string"
            },
            "website": {
              "type": "string"
            },
            "description": {
              "type": "string"
            },
            "content": {
              "type": "string"
            },
            "foundedDate": {
              "type": "string"
            },
            "address": {
              "type": "string"
            },
            "city": {
              "type": "string"
            },
            "country": {
              "type": "string"
            },
            "createdBy": {
              "$ref": "#/components/schemas/User"
            }
          },
          "required": [
            "logo",
            "name",
            "email",
            "industry",
            "phone",
            "website",
            "description",
            "content",
            "foundedDate",
            "address",
            "city",
            "country",
            "createdBy"
          ]
        },
        "Picture": {
          "type": "object",
          "properties": {
            "url": {
              "type": "string"
            },
            "path": {
              "type": "string"
            },
            "originalname": {
              "type": "string"
            }
          },
          "required": [
            "url",
            "path",
            "originalname"
          ]
        },
        "CompanyDto": {
          "type": "object",
          "properties": {
            "name": {
              "type": "string",
              "example": "Google",
              "description": "Company name"
            },
            "logo": {
              "description": "Company Logo",
              "allOf": [
                {
                  "$ref": "#/components/schemas/Picture"
                }
              ]
            },
            "email": {
              "type": "string",
              "example": "xyx@.abc.def",
              "description": "Company Email"
            },
            "industry": {
              "type": "string",
              "example": "Web3",
              "description": "Industry name in which your company falls"
            },
            "phone": {
              "type": "string",
              "example": "+923008764803",
              "description": "Company phone"
            },
            "website": {
              "type": "string",
              "example": "www.mywebsite.pk",
              "description": "Company Website"
            },
            "password": {
              "type": "string",
              "minLength": 8,
              "example": "thisispass",
              "description": "Password for the company"
            }
          },
          "required": [
            "name",
            "logo",
            "email",
            "industry",
            "phone",
            "website",
            "password"
          ]
        },
        "UpdateCompanyDto": {
          "type": "object",
          "properties": {
            "logo": {
              "description": "Company logo",
              "allOf": [
                {
                  "$ref": "#/components/schemas/Picture"
                }
              ]
            },
            "name": {
              "type": "string",
              "example": "Google",
              "description": "Company name"
            },
            "email": {
              "type": "string",
              "example": "xyx@gmail.com",
              "description": "Company Email"
            },
            "industry": {
              "type": "string",
              "example": "Web3",
              "description": "Industry name in which your company falls"
            },
            "phone": {
              "type": "string",
              "description": "Company phone"
            },
            "website": {
              "type": "string",
              "description": "Company Website"
            },
            "description": {
              "type": "string",
              "example": "abc is a web3 company",
              "description": "Description for your company"
            },
            "content": {
              "type": "string",
              "example": "more description",
              "description": "Any more content"
            },
            "foundedDate": {
              "type": "string",
              "example": "23 Aug, 2023",
              "description": "Fouded Date for company"
            },
            "address": {
              "type": "string",
              "example": "",
              "description": "Company address"
            },
            "city": {
              "type": "string",
              "example": "New York",
              "description": "Company city"
            },
            "country": {
              "type": "string",
              "example": "Pakistan",
              "description": "Company Country"
            }
          }
        },
        "EmailDto": {
          "type": "object",
          "properties": {
            "email": {
              "type": "string",
              "example": "john@xyz.abc",
              "description": "The Email Address"
            }
          },
          "required": [
            "email"
          ]
        },
        "changePasswordDto": {
          "type": "object",
          "properties": {
            "new_password": {
              "type": "string",
              "minLength": 6,
              "example": "thisisnewpassword",
              "description": "provide new password"
            },
            "email": {
              "type": "string",
              "example": "toor@gmail.com",
              "description": "provide Email address"
            }
          },
          "required": [
            "new_password",
            "email"
          ]
        },
        "NotFoundException": {
          "type": "object",
          "properties": {}
        },
        "AuthUserDto": {
          "type": "object",
          "properties": {
            "user": {
              "type": "object",
              "properties": {
                "email": {
                  "required": false,
                  "type": "string"
                },
                "name": {
                  "required": true,
                  "type": "string"
                },
                "phone": {
                  "required": true,
                  "type": "string"
                },
                "_id": {
                  "required": true,
                  "type": "string"
                }
              }
            },
            "isEmailVerified": {
              "type": "boolean",
              "example": true,
              "description": "Verified user or not"
            },
            "_id": {
              "type": "string",
              "description": "Id of user"
            },
            "lastLogin": {
              "type": "string",
              "description": "Last Login info"
            }
          },
          "required": [
            "user",
            "isEmailVerified",
            "_id",
            "lastLogin"
          ]
        },
        "BadRequestException": {
          "type": "object",
          "properties": {}
        },
        "ConflictException": {
          "type": "object",
          "properties": {}
        },
        "CandidateDto": {
          "type": "object",
          "properties": {
            "name": {
              "type": "string",
              "example": "john Doe",
              "description": "The name of the candidate"
            },
            "email": {
              "type": "string",
              "example": "johnDoe@xyz.abc",
              "description": "The email of the candidate"
            },
            "phone": {
              "type": "string",
              "example": "+923008648940",
              "description": "The phone number of the candidate"
            },
            "gender": {
              "type": "string",
              "example": "male",
              "description": "The gender of the candidate"
            },
            "password": {
              "type": "string",
              "minLength": 6,
              "example": "thisispassword",
              "description": "The password of the candidate"
            }
          },
          "required": [
            "name",
            "email",
            "phone",
            "gender",
            "password"
          ]
        },
        "loginDto": {
          "type": "object",
          "properties": {
            "email": {
              "type": "string",
              "example": "john@gmail.com",
              "description": "The Email Address"
            },
            "password": {
              "type": "string",
              "example": "password",
              "description": "Password for login"
            }
          },
          "required": [
            "email",
            "password"
          ]
        },
        "UnauthorizedException": {
          "type": "object",
          "properties": {}
        },
        "OtpDto": {
          "type": "object",
          "properties": {
            "email": {
              "type": "string",
              "example": "john@xyz.abc",
              "description": "The Email of the candidate"
            },
            "OTP": {
              "type": "string",
              "example": "111222",
              "description": "OTP received in email"
            }
          },
          "required": [
            "email",
            "OTP"
          ]
        },
        "CreateUserDto": {
          "type": "object",
          "properties": {
            "name": {
              "type": "string",
              "minLength": 8,
              "description": "Name of the user"
            },
            "email": {
              "type": "string",
              "description": "Email of the user"
            },
            "password": {
              "type": "string",
              "minLength": 8,
              "description": "Password of the user"
            },
            "company": {
              "type": "string"
            },
            "companyTeam": {
              "type": "string"
            },
            "candidate": {
              "type": "string"
            }
          },
          "required": [
            "name",
            "email",
            "password",
            "company",
            "companyTeam",
            "candidate"
          ]
        },
        "message": {
          "type": "object",
          "properties": {
            "message": {
              "type": "string",
              "example": "User found",
              "description": "User found or User not found"
            }
          },
          "required": [
            "message"
          ]
        },
        "UpdateUserDto": {
          "type": "object",
          "properties": {}
        },
        "Candidate": {
          "type": "object",
          "properties": {
            "name": {
              "type": "string"
            },
            "email": {
              "type": "string"
            },
            "phone": {
              "type": "string"
            },
            "password": {
              "type": "string"
            },
            "gender": {
              "type": "string"
            },
            "nationality": {
              "type": "string"
            },
            "linkedin": {
              "type": "string"
            },
            "portfolioSite": {
              "type": "string"
            },
            "cvUrl": {
              "type": "object",
              "properties": {
                "url": {
                  "required": true,
                  "type": "string"
                },
                "path": {
                  "required": true,
                  "type": "string"
                },
                "originalname": {
                  "required": true,
                  "type": "string"
                }
              }
            },
            "coverLetterUrl": {
              "type": "object",
              "properties": {
                "url": {
                  "required": true,
                  "type": "string"
                },
                "path": {
                  "required": true,
                  "type": "string"
                },
                "originalname": {
                  "required": true,
                  "type": "string"
                }
              }
            },
            "avatar": {
              "type": "object",
              "properties": {
                "url": {
                  "required": true,
                  "type": "string"
                },
                "path": {
                  "required": true,
                  "type": "string"
                },
                "originalname": {
                  "required": true,
                  "type": "string"
                }
              }
            },
            "createdBy": {
              "$ref": "#/components/schemas/User"
            }
          },
          "required": [
            "name",
            "email",
            "phone",
            "password",
            "gender",
            "nationality",
            "linkedin",
            "portfolioSite",
            "cvUrl",
            "coverLetterUrl",
            "avatar",
            "createdBy"
          ]
        },
        "CandidateObj": {
          "type": "object",
          "properties": {
            "name": {
              "type": "string",
              "example": "john Doe",
              "description": "The name of the candidate"
            },
            "nationality": {
              "type": "string",
              "example": "Pakistani",
              "description": "nationality of candidate"
            },
            "portfolioSite": {
              "type": "string",
              "description": "The portfolio link of the candidate"
            },
            "linkedin": {
              "type": "string",
              "description": "The linkedin profile link of the candidate"
            },
            "email": {
              "type": "string",
              "example": "johnDoe@xyz.abc",
              "description": "The email of the candidate"
            },
            "phone": {
              "type": "string",
              "example": "+923008648940",
              "description": "The phone number of the candidate"
            },
            "gender": {
              "type": "string",
              "example": "male",
              "description": "The gender of the candidate"
            },
            "password": {
              "type": "string",
              "example": "thisispassword",
              "description": "The password of the candidate"
            },
            "createdBy": {
              "type": "string"
            },
            "avatar": {
              "description": "Candidate Avatar",
              "allOf": [
                {
                  "$ref": "#/components/schemas/Picture"
                }
              ]
            },
            "cvUrl": {
              "description": "Candidate CvUrl",
              "allOf": [
                {
                  "$ref": "#/components/schemas/Picture"
                }
              ]
            },
            "coverLetterUrl": {
              "description": "Candidate CoverLetter",
              "allOf": [
                {
                  "$ref": "#/components/schemas/Picture"
                }
              ]
            }
          },
          "required": [
            "name",
            "nationality",
            "portfolioSite",
            "linkedin",
            "email",
            "phone",
            "gender",
            "password",
            "createdBy",
            "avatar",
            "cvUrl",
            "coverLetterUrl"
          ]
        },
        "UpdateCandidateDto": {
          "type": "object",
          "properties": {
            "name": {
              "type": "string",
              "example": "john Doe",
              "description": "The name of the candidate"
            },
            "email": {
              "type": "string",
              "example": "johnDoe@xyz.abc",
              "description": "The email of the candidate"
            },
            "phone": {
              "type": "string",
              "description": "The phone number of the candidate"
            },
            "gender": {
              "type": "string",
              "example": "male",
              "description": "The gender of the candidate"
            },
            "nationality": {
              "type": "string",
              "description": "The nationality of the candidate"
            },
            "linkedin": {
              "type": "string",
              "description": "The LinkedIn profile of the candidate"
            },
            "portfolioSite": {
              "type": "string",
              "description": "The portfolio site of the candidate"
            },
            "cvUrl": {
              "description": "The CV URL of the candidate",
              "allOf": [
                {
                  "$ref": "#/components/schemas/Picture"
                }
              ]
            },
            "coverLetterUrl": {
              "description": "The cover letter URL of the candidate",
              "allOf": [
                {
                  "$ref": "#/components/schemas/Picture"
                }
              ]
            },
            "avatar": {
              "description": "The avatar URL of the candidate",
              "allOf": [
                {
                  "$ref": "#/components/schemas/Picture"
                }
              ]
            }
          }
        },
        "CreateMCQDto": {
          "type": "object",
          "properties": {
            "title": {
              "type": "string",
              "example": "Sample MCQ Question",
              "description": "The title of the MCQ"
            },
            "question": {
              "type": "string",
              "example": "description",
              "description": "extra information for the MCQ"
            },
            "options": {
              "example": [
                "Option A",
                "Option B",
                "Option C",
                "Option D"
              ],
              "description": "Array of options for the MCQ",
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "correctOption": {
              "type": "string",
              "example": "Option A",
              "description": "The correct option for the MCQ"
            },
            "difficultyLevel": {
              "type": "string",
              "example": "easy",
              "description": "easy or medium or hard"
            },
            "language": {
              "type": "string",
              "example": "JavaScript",
              "description": "Language MCQ falls in"
            },
            "tags": {
              "example": [
                "frt543212346trfyu7654ew2"
              ],
              "description": "ref ids for tags",
              "type": "array",
              "items": {
                "type": "string"
              }
            }
          },
          "required": [
            "title",
            "question",
            "options",
            "correctOption",
            "difficultyLevel",
            "language",
            "tags"
          ]
        },
        "CreateMcqDtoArray": {
          "type": "object",
          "properties": {
            "mcqs": {
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/CreateMCQDto"
              }
            }
          },
          "required": [
            "mcqs"
          ]
        },
        "UpdateMcqDto": {
          "type": "object",
          "properties": {
            "title": {
              "type": "string",
              "example": "Sample MCQ Question",
              "description": "The title of the MCQ"
            },
            "question": {
              "type": "string",
              "example": "description",
              "description": "extra information for the MCQ"
            },
            "options": {
              "example": [
                "Option A",
                "Option B",
                "Option C",
                "Option D"
              ],
              "description": "Array of options for the MCQ",
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "correctOption": {
              "type": "string",
              "example": "Option A",
              "description": "The correct option for the MCQ"
            },
            "difficultyLevel": {
              "type": "string",
              "example": "easy",
              "description": "easy or medium or hard"
            },
            "language": {
              "type": "string",
              "example": "JavaScript",
              "description": "Language MCQ falls in"
            },
            "tags": {
              "example": [
                "frt543212346trfyu7654ew2"
              ],
              "description": "ref ids for tags",
              "type": "array",
              "items": {
                "type": "string"
              }
            }
          }
        },
        "TestCase": {
          "type": "object",
          "properties": {
            "input": {
              "type": "string",
              "example": "1"
            },
            "output": {
              "type": "string",
              "example": "3"
            }
          },
          "required": [
            "input",
            "output"
          ]
        },
        "CodingQuestionDto": {
          "type": "object",
          "properties": {
            "title": {
              "type": "string",
              "example": "Sample Title",
              "description": "The title of the coding question."
            },
            "description": {
              "type": "string",
              "example": "Sample Description",
              "description": "The description of the coding question."
            },
            "language": {
              "type": "string",
              "example": "JavaScript",
              "description": "The programming language used for the question."
            },
            "functionName": {
              "type": "string",
              "example": "calculateSum",
              "description": "The name of the function to be implemented."
            },
            "challengeCode": {
              "type": "string",
              "example": "function calculateSum(a, b)",
              "description": "The challenge code for the question."
            },
            "solutionCode": {
              "type": "string",
              "example": "function calculateSum(a, b) { return a + b; }",
              "description": "The solution code for the question."
            },
            "tags": {
              "example": [
                "gt12345rt562fgrtyu65"
              ],
              "description": "ref ids for tags",
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "explanation": {
              "type": "string",
              "example": "Here is an explanation of the solution.",
              "description": "Explanation of the solution for the question."
            },
            "testCases": {
              "example": [
                {
                  "input": "1",
                  "output": "3"
                }
              ],
              "description": "Test cases for the question in JSON format.",
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/TestCase"
              }
            },
            "difficultyLevel": {
              "type": "string",
              "example": "medium",
              "description": "The difficulty Level of the Question"
            }
          },
          "required": [
            "title",
            "description",
            "language",
            "functionName",
            "challengeCode",
            "solutionCode",
            "tags",
            "explanation",
            "testCases",
            "difficultyLevel"
          ]
        },
        "UpdateCodingQuestionDto": {
          "type": "object",
          "properties": {
            "title": {
              "type": "string",
              "example": "Sample Title",
              "description": "The title of the coding question."
            },
            "description": {
              "type": "string",
              "example": "Sample Description",
              "description": "The description of the coding question."
            },
            "language": {
              "type": "string",
              "example": "JavaScript",
              "description": "The programming language used for the question."
            },
            "functionName": {
              "type": "string",
              "example": "calculateSum",
              "description": "The name of the function to be implemented."
            },
            "challengeCode": {
              "type": "string",
              "example": "function calculateSum(a, b)",
              "description": "The challenge code for the question."
            },
            "solutionCode": {
              "type": "string",
              "example": "function calculateSum(a, b) { return a + b; }",
              "description": "The solution code for the question."
            },
            "tags": {
              "example": [
                "gt12345rt562fgrtyu65"
              ],
              "description": "ref ids for tags",
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "explanation": {
              "type": "string",
              "example": "Here is an explanation of the solution.",
              "description": "Explanation of the solution for the question."
            },
            "testCases": {
              "example": [
                {
                  "input": "1",
                  "output": "3"
                }
              ],
              "description": "Test cases for the question in JSON format.",
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/TestCase"
              }
            },
            "difficultyLevel": {
              "type": "string",
              "example": "medium",
              "description": "The difficulty Level of the Question"
            }
          }
        },
        "CreateTagDto": {
          "type": "object",
          "properties": {
            "tagName": {
              "type": "string",
              "example": "JavaScript",
              "description": "The name of tag"
            }
          },
          "required": [
            "tagName"
          ]
        },
        "UpdateTagDto": {
          "type": "object",
          "properties": {
            "tagName": {
              "type": "string",
              "example": "JavaScript",
              "description": "The name of tag"
            }
          }
        },
        "CandidateApplicationDto": {
          "type": "object",
          "properties": {
            "status": {
              "type": "string",
              "example": "viewed",
              "description": "applied viewed interviewing offered rejected"
            },
            "candidate": {
              "type": "string",
              "description": "The id of the candidate"
            },
            "job": {
              "type": "string",
              "description": "The id of the Job"
            },
            "candidate_assessment": {
              "type": "string",
              "description": "The id of the candidate Assessment"
            }
          },
          "required": [
            "status",
            "candidate",
            "job",
            "candidate_assessment"
          ]
        },
        "UpdateCandidateApplicationDto": {
          "type": "object",
          "properties": {
            "status": {
              "type": "string",
              "example": "viewed",
              "description": "applied viewed interviewing offered rejected"
            },
            "candidate": {
              "type": "string",
              "description": "The id of the candidate"
            },
            "job": {
              "type": "string",
              "description": "The id of the Job"
            },
            "candidate_assessment": {
              "type": "string",
              "description": "The id of the candidate Assessment"
            }
          }
        },
        "Difficulty": {
          "type": "object",
          "properties": {
            "easy": {
              "type": "number",
              "example": "12"
            },
            "medium": {
              "type": "number",
              "example": "20"
            },
            "hard": {
              "type": "number",
              "example": "13"
            }
          },
          "required": [
            "easy",
            "medium",
            "hard"
          ]
        },
        "CreateExamDto": {
          "type": "object",
          "properties": {
            "title": {
              "type": "string",
              "example": "this is a Title",
              "description": "The title of the Exam."
            },
            "description": {
              "type": "string",
              "example": "Sample Description",
              "description": "The description of the Exam."
            },
            "passingPercent": {
              "type": "number",
              "example": "72",
              "description": "The passing percentage for the Exam."
            },
            "totalMarks": {
              "type": "number",
              "example": "23",
              "description": "Total marks of Exam"
            },
            "MCQDurationMinutes": {
              "type": "number",
              "example": "30",
              "description": "Duration Minutes for MCQs."
            },
            "CodingDurationMinutes": {
              "type": "number",
              "example": "15",
              "description": "Duration Minutes for COding Questions."
            },
            "language": {
              "type": "string",
              "example": "Data Structures",
              "description": "Language for Exam."
            },
            "mcqDifficultyComposition": {
              "example": {
                "easy": 5,
                "medium": 10,
                "hard": 12
              },
              "description": "easy medium hard",
              "allOf": [
                {
                  "$ref": "#/components/schemas/Difficulty"
                }
              ]
            },
            "codingDifficultyComposition": {
              "example": {
                "easy": 5,
                "medium": 10,
                "hard": 12
              },
              "description": "easy or medium or hard",
              "allOf": [
                {
                  "$ref": "#/components/schemas/Difficulty"
                }
              ]
            },
            "tags": {
              "example": [
                "651531aed0e92404e54183d8"
              ],
              "description": "ref ids for tags",
              "type": "array",
              "items": {
                "type": "string"
              }
            }
          },
          "required": [
            "title",
            "description",
            "passingPercent",
            "totalMarks",
            "MCQDurationMinutes",
            "CodingDurationMinutes",
            "language",
            "mcqDifficultyComposition",
            "codingDifficultyComposition",
            "tags"
          ]
        },
        "ExamDto": {
          "type": "object",
          "properties": {
            "_id": {
              "type": "string",
              "example": "this is a id of exam",
              "description": "The id of the Exam."
            },
            "title": {
              "type": "string",
              "example": "this is a Title",
              "description": "The title of the Exam."
            },
            "description": {
              "type": "string",
              "example": "Sample Description",
              "description": "The description of the Exam."
            },
            "passingPercent": {
              "type": "number",
              "example": "72",
              "description": "The passing percentage for the Exam."
            },
            "totalMarks": {
              "type": "number",
              "example": "23",
              "description": "Total marks of Exam"
            },
            "MCQDurationMinutes": {
              "type": "number",
              "example": "30",
              "description": "Duration Minutes for MCQs."
            },
            "CodingDurationMinutes": {
              "type": "number",
              "example": "15",
              "description": "Duration Minutes for COding Questions."
            },
            "language": {
              "type": "string",
              "example": "Data Structures",
              "description": "Language for Exam."
            },
            "mcqDifficultyComposition": {
              "example": {
                "easy": 5,
                "medium": 10,
                "hard": 12
              },
              "description": "easy medium hard",
              "allOf": [
                {
                  "$ref": "#/components/schemas/Difficulty"
                }
              ]
            },
            "codingDifficultyComposition": {
              "example": {
                "easy": 5,
                "medium": 10,
                "hard": 12
              },
              "description": "easy or medium or hard",
              "allOf": [
                {
                  "$ref": "#/components/schemas/Difficulty"
                }
              ]
            },
            "tags": {
              "example": [
                "651531aed0e92404e54183d8"
              ],
              "description": "ref ids for tags",
              "type": "array",
              "items": {
                "type": "string"
              }
            }
          },
          "required": [
            "_id",
            "title",
            "description",
            "passingPercent",
            "totalMarks",
            "MCQDurationMinutes",
            "CodingDurationMinutes",
            "language",
            "mcqDifficultyComposition",
            "codingDifficultyComposition",
            "tags"
          ]
        },
        "UpdateExamDto": {
          "type": "object",
          "properties": {
            "title": {
              "type": "string",
              "example": "this is a Title",
              "description": "The title of the Exam."
            },
            "description": {
              "type": "string",
              "example": "Sample Description",
              "description": "The description of the Exam."
            },
            "passingPercent": {
              "type": "number",
              "example": "72",
              "description": "The passing percentage for the Exam."
            },
            "totalMarks": {
              "type": "number",
              "example": "23",
              "description": "Total marks of Exam"
            },
            "MCQDurationMinutes": {
              "type": "number",
              "example": "30",
              "description": "Duration Minutes for MCQs."
            },
            "CodingDurationMinutes": {
              "type": "number",
              "example": "15",
              "description": "Duration Minutes for COding Questions."
            },
            "language": {
              "type": "string",
              "example": "Data Structures",
              "description": "Language for Exam."
            },
            "mcqDifficultyComposition": {
              "example": {
                "easy": 5,
                "medium": 10,
                "hard": 12
              },
              "description": "easy medium hard",
              "allOf": [
                {
                  "$ref": "#/components/schemas/Difficulty"
                }
              ]
            },
            "codingDifficultyComposition": {
              "example": {
                "easy": 5,
                "medium": 10,
                "hard": 12
              },
              "description": "easy or medium or hard",
              "allOf": [
                {
                  "$ref": "#/components/schemas/Difficulty"
                }
              ]
            },
            "tags": {
              "example": [
                "651531aed0e92404e54183d8"
              ],
              "description": "ref ids for tags",
              "type": "array",
              "items": {
                "type": "string"
              }
            }
          }
        },
        "CreateCandidateAssessmentDto": {
          "type": "object",
          "properties": {
            "exam": {
              "type": "string",
              "description": "The ID of the exam"
            }
          },
          "required": [
            "exam"
          ]
        },
        "ExamMcqQuestion": {
          "type": "object",
          "properties": {
            "_id": {
              "type": "string",
              "description": "id of question"
            },
            "title": {
              "type": "string",
              "description": "title of The question"
            },
            "options": {
              "description": "options for The question",
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "isFinished": {
              "type": "boolean",
              "description": "Indicates whether the question ended or not"
            }
          },
          "required": [
            "_id",
            "title",
            "options",
            "isFinished"
          ]
        },
        "Tag": {
          "type": "object",
          "properties": {
            "tagName": {
              "type": "string"
            },
            "user": {
              "$ref": "#/components/schemas/User"
            }
          },
          "required": [
            "tagName",
            "user"
          ]
        },
        "MCQ": {
          "type": "object",
          "properties": {
            "title": {
              "type": "string"
            },
            "question": {
              "type": "string"
            },
            "options": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "correctOption": {
              "type": "string"
            },
            "language": {
              "type": "string"
            },
            "difficultyLevel": {
              "type": "string"
            },
            "tags": {
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/Tag"
              }
            },
            "createdBy": {
              "$ref": "#/components/schemas/Company"
            }
          },
          "required": [
            "title",
            "question",
            "options",
            "correctOption",
            "language",
            "difficultyLevel",
            "tags",
            "createdBy"
          ]
        },
        "CodingQuestion": {
          "type": "object",
          "properties": {
            "title": {
              "type": "string"
            },
            "description": {
              "type": "string"
            },
            "language": {
              "type": "string"
            },
            "functionName": {
              "type": "string"
            },
            "challengeCode": {
              "type": "string"
            },
            "solutionCode": {
              "type": "string"
            },
            "explanation": {
              "type": "string"
            },
            "testCases": {
              "type": "array",
              "items": {
                "type": "object"
              }
            },
            "difficultyLevel": {
              "type": "string"
            },
            "tags": {
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/Tag"
              }
            },
            "createdBy": {
              "$ref": "#/components/schemas/Company"
            }
          },
          "required": [
            "title",
            "description",
            "language",
            "functionName",
            "challengeCode",
            "solutionCode",
            "explanation",
            "testCases",
            "difficultyLevel",
            "tags",
            "createdBy"
          ]
        },
        "CandidateAssessment": {
          "type": "object",
          "properties": {
            "candidate": {
              "type": "string"
            },
            "exam": {
              "type": "string"
            },
            "mcqQuestions": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "mcqs": {
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/MCQ"
              }
            },
            "codingQuestions": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "codings": {
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/CodingQuestion"
              }
            },
            "score": {
              "type": "number"
            },
            "status": {
              "type": "string"
            },
            "feedback": {
              "type": "string"
            },
            "testPointer": {
              "type": "object",
              "properties": {
                "index": {
                  "required": true,
                  "type": "number"
                },
                "mcqtimeLeft": {
                  "required": true,
                  "type": "number"
                },
                "activeMcqs": {
                  "required": true,
                  "type": "boolean"
                },
                "activeCoding": {
                  "required": true,
                  "type": "boolean"
                },
                "codingtimeLeft": {
                  "required": true,
                  "type": "number"
                },
                "isFinished": {
                  "required": true,
                  "type": "boolean"
                },
                "attempts": {
                  "required": true,
                  "type": "number"
                },
                "points": {
                  "required": true,
                  "type": "number"
                }
              }
            }
          },
          "required": [
            "candidate",
            "exam",
            "mcqQuestions",
            "mcqs",
            "codingQuestions",
            "codings",
            "score",
            "status",
            "feedback",
            "testPointer"
          ]
        },
        "ExamCodingQuestion": {
          "type": "object",
          "properties": {
            "_id": {
              "type": "string",
              "description": "id of question"
            },
            "title": {
              "type": "string",
              "description": "The coding question data"
            },
            "description": {
              "type": "string",
              "description": "The description"
            },
            "challengeCode": {
              "type": "string",
              "description": "The challenge code"
            }
          },
          "required": [
            "_id",
            "title",
            "description",
            "challengeCode"
          ]
        },
        "AssessmentCodingObj": {
          "type": "object",
          "properties": {
            "isFinished": {
              "type": "boolean",
              "example": false,
              "description": "true or false"
            },
            "question": {
              "description": "question returned",
              "allOf": [
                {
                  "$ref": "#/components/schemas/ExamCodingQuestion"
                }
              ]
            },
            "isCodingQuestion": {
              "type": "boolean",
              "example": false,
              "description": "false or true"
            }
          },
          "required": [
            "isFinished",
            "question",
            "isCodingQuestion"
          ]
        },
        "AssessmentMcqObj": {
          "type": "object",
          "properties": {
            "isFinished": {
              "type": "boolean",
              "example": false,
              "description": "true or false"
            },
            "question": {
              "description": "question returned",
              "allOf": [
                {
                  "$ref": "#/components/schemas/ExamMcqQuestion"
                }
              ]
            },
            "isCodingQuestion": {
              "type": "boolean",
              "example": false,
              "description": "false or true"
            }
          },
          "required": [
            "isFinished",
            "question",
            "isCodingQuestion"
          ]
        },
        "QuestionType": {
          "type": "object",
          "properties": {
            "questionId": {
              "type": "string",
              "description": "ref id for the question"
            },
            "answer": {
              "type": "string",
              "description": "answer given by the candidate"
            }
          },
          "required": [
            "questionId",
            "answer"
          ]
        },
        "UpdateCandidateAssessmentDto": {
          "type": "object",
          "properties": {
            "remainingTime": {
              "type": "number",
              "description": "The Remaining time of the exam"
            },
            "question": {
              "description": "The answer to the question",
              "allOf": [
                {
                  "$ref": "#/components/schemas/QuestionType"
                }
              ]
            }
          }
        }
      }
    }
  },
  "customOptions": {}
};
  url = options.swaggerUrl || url
  let urls = options.swaggerUrls
  let customOptions = options.customOptions
  let spec1 = options.swaggerDoc
  let swaggerOptions = {
    spec: spec1,
    url: url,
    urls: urls,
    dom_id: '#swagger-ui',
    deepLinking: true,
    presets: [
      SwaggerUIBundle.presets.apis,
      SwaggerUIStandalonePreset
    ],
    plugins: [
      SwaggerUIBundle.plugins.DownloadUrl
    ],
    layout: "StandaloneLayout"
  }
  for (let attrname in customOptions) {
    swaggerOptions[attrname] = customOptions[attrname];
  }
  let ui = SwaggerUIBundle(swaggerOptions)

  if (customOptions.initOAuth) {
    ui.initOAuth(customOptions.initOAuth)
  }

  if (customOptions.authAction) {
    ui.authActions.authorize(customOptions.authAction)
  }
  
  window.ui = ui
}
