
## DATABASE DESIGN

### Coding Challenge

- id
- title
- description
- language
- functionName
- challengeCode
- solutionCode
- explanation
- testCases
- difficultyLevel
- user
- createdAt
- updatedAt

### MCQ Challenge

- id
- title
- description
- option
- correctOption
- explanation
- language
- difficultyLevel
- user
- createdAt
- updatedAt

### Programming Language

- id
- name
- description
- user
- createdAt
- updatedAt

### User (admin, HR, recruiter, interviewer)

- id
- name
- email
- password
- lastLogin
- userType
- createdAt
- updatedAt

### Company

- id
- name
- description
- content
- industry
- foundedDate
- email
- phone
- address
- city
- country
- website
- linkedin
- user
- createdAt
- updatedAt

### Job

- id
- title
- description
- content
- company
- location
- salaryRange
- employmentType
- applicationDeadline
- user
- createdAt
- updatedAt

### Candidate

- id
- name
- email
- phone
- gender
- nationality
- linkedin
- portfolioSite
- company (id)
- address
- cvUrl
- coverLetterUrl
- image
- user
- createdAt
- updatedAt

### Candidate Application

- id
- candidate (id)
- company (id)
- job (id)
- interviewDate
- interviewNote
- status (applied, interviewing, offered, rejected)
- createdAt
- updatedAt

### Candidate Assessment

- id
- candidate (id)
- job (id)
- interviewer (user id)
- assessmentDate
- score
- status (Pending, Completed, Reviewed, Rejected, Accepted)
- feedback
- user
- createdAt
- updatedAt

### Package

- id
- name
- description
- price
- billingCycle (Monthly, Annual)
- feature
- user
- createdAt
- updatedAt