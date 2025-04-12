# Overview

Websites are the front door to any business and are especially critical for a restaurant. **90% of customers** that visit a restaurant have already researched it online prior to dining there, more than any other type of business. With so much interest and competition, it’s extremely important to make the right first impression. This is why the elegant, fine-dining establishment, **Café Fausse**, has reached out to your team for a brand-new website. They know you can deliver a product that is in line with their own high standards. It looks like you will need to pull out all the stops to impress them!

To do this, you will be developing a complete web application to meet specific software requirements. While significant testing is not expected (testing approaches will be covered in a later concentration), you should have a complete development version that addresses all software requirements.

While the web application can be completed as part of a group of up to three people, every student will submit their deliverable individually. This deliverable includes a recorded presentation in which the student alone must demonstrate the functionality of their web application.

---

# Learning Outcomes

When completed successfully, this project will enable you to:

- Develop working websites using **React and JSX**, and **Flask**.
- Translate customer requirements into a working web application.
- Carry out high-quality UI and UX design.
- Develop backend logic and a backend database using **Flask** and **PostgreSQL**.
- Implement client-side forms with React and form handling with Flask.
- Utilize AI tooling for rapid and high-quality software development.

---

# Project Description

You have been provided with:

- A copy of the **software requirements specification** for this project.
- A collection of images for you to use.

While you can fully hand-code this project if you wish, you are highly encouraged to utilize leading AI code generation models/AI IDEs to assist in rapidly producing your web application. Be sure to describe in broad terms how you made use of them. 

### Key Features to Include:

1. **Contact Information**: Address, phone number, hours.
2. **Menu**: Broken up by categories.
3. **About Us Page**: Highlighting the owners.
4. **Email Sign-Up**: For a newsletter.
5. **Photo Gallery Page**: Judicious use of photos throughout the site.
6. **Showcase Awards and Reviews**.
7. **Table Reservation System**: Allow customers to make reservations online.

### Reservation System Requirements:

- Build a front-end interface using forms and a back-end SQL database.
- Use **React** for the front-end form and **Flask/Python** with **PostgreSQL** for the back-end logic and database.
- The database should include:
    - **Customers Table**: `Customer ID`, `Customer Name`, `Customer Email`, `Phone Number`, `Newsletter Signup`.
    - **Reservations Table**: `Reservation ID`, `Customer ID`, `Time Slot` (date and time), `Table Number`.
- The system should:
    - Add customer information to the database.
    - Assign a random table for the chosen time slot (assume 30 tables total).
    - Confirm successful reservations or notify the user if the time slot is fully booked.

### Minimum Pages:

1. **Main (Index) Page**
2. **Menu**
3. **Reservations**
4. **About Us**
5. **Gallery**

Additional elements (e.g., email sign-up) may be included on these or other pages. Ensure a consistent thematic look and feel by applying a **CSS Grid** or **Flexbox** approach to design.

---

# Presentation Requirements

Your presentation must:

- Be submitted as a recording where you are present and visible on-screen, along with your screen recording.
- Last **5-10 minutes** and demonstrate:
    - Navigation between all five (or more) pages.
    - Functionality of the email sign-up for the newsletter.
    - A correctly functioning reservation system.
    - The effect of reservations and newsletter sign-up on the backend database.
- Discuss implementation decisions.
- Include a government-issued ID for verification.

---

# Submission Guidelines

Each student must submit individually. Your submission should include:

1. **Source Code**: Frontend and backend, with a README file describing your solution and how to run it locally.
2. **AI Tooling Document**: Summarizing any AI tools used and their effectiveness.
3. **Optional**: A link to the staging version (if applicable).

Submit your project via the "Submit Project" button on your dashboard. If working in a group, upload the final page of your **Group Project Agreement**, signed by all members.

---

# Plagiarism Policy

Quantic defines plagiarism as: “Knowingly representing the work of others as one’s own, engaging in any acts of plagiarism, or referencing the works of others without appropriate citation.” All submissions are monitored for plagiarism, and violations will result in conduct penalties. When in doubt, **cite your sources**.

---

# Project Rubric

| **Score** | **Description**                                                                 |
|-----------|---------------------------------------------------------------------------------|
| **5**     | Addresses **ALL** project requirements, including:                             |
|           | - Minimum five pages built using React and JSX.                                |
|           | - All requirements from the SRS implemented.                                   |
|           | - Excellent UI/UX design with consistent CSS Grid/Flexbox usage.               |
|           | - Fully functional forms and backend integration with Flask and PostgreSQL.    |
|           | - Document outlining AI tools used and their effectiveness.                    |

Scores **2 and above** are considered passing. Scores **1 or 0** require revision and resubmission.

