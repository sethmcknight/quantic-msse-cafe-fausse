# AI Tools Used in Developing Cafe Fausse

In developing the Cafe Fausse website we used Github Copilot, including Agent mode, with multiple models.

Thie site repo is available at https://github.com/sethmcknight/quantic-msse-cafe-fausse

We started by creating a git repo, uploading a copy of the Project Rubric and Software Requirements Specification documents as markdown files, and creating a copilot-instructions markdown document that outlines the main technical constraints from the Requirements document. We then prompted Copilot Agent to create a project plan and share the steps and components. 

After reviewing and updating the plan we prompted Copilot Agent (primarily using Claude 3.7 Sonnet) to walk through the steps of creating the website. After each round of code generation we reviewed the code and accepted, edited, or prompted changes. The majority of the code was accepted at this time. In about 3 hours we were able to have a website up and running locally that met about 75% of the software and rubric requirements.

After the initial creation and commit, the remaining work was primarily cleaning up the forms, content, and CSS for responsiveness and to meet the needed upscale design. This was iterated on with a mix of Copilot Agent, Copilot chatbot to ask questions, Copilot in-line edits, and manual code and troubleshooting.

While not perfect in any sense, these tools were highly beneficial in developing this website and helped us create the code far more quickly than we would have if only manually developing. Providing more explicit instructions up-front would have likely provided a more complete responsive design and reduced the clean up needed on the Reservation form integration.