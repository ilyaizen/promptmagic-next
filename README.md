# PromptMagic

PromptMagic is an advanced tool designed to create and refine custom AI prompts. It begins with an initial prompt input area that offers auto-complete text suggestions to boost creativity, optimize responses, and streamline the prompt generation process. Users can then customize parameters, choose styles, and receive tailored output suggestions. Additional features will be introduced over time.

## Features

- Interactive prompt creation and refinement
- AI-powered suggestions and improvements
- Step-by-step wizard interface
- Responsive design using Tailwind CSS
- Dark mode support

## Technologies Used

- [Next.js](https://nextjs.org/) - React framework for server-side rendering and static site generation
- [React](https://reactjs.org/) - JavaScript library for building user interfaces
- [TypeScript](https://www.typescriptlang.org/) - Typed superset of JavaScript
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Shadcn UI](https://ui.shadcn.com/) - UI component library
- [OpenAI API](https://openai.com/api/) - AI-powered text generation and completion

## Getting Started

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/promptmagic-next.git
   cd promptmagic-next
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   Create a `.env.local` file in the root directory and add your OpenAI API key:

   ```
   OPENAI_API_KEY=your_api_key_here
   ```

4. Run the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `app/`: Contains the main application code
- `components/`: Reusable React components
- `hooks/`: Custom React hooks
- `lib/`: Utility functions and helpers
- `public/`: Static assets

## Key Components

- `PromptMagic`: Main component that orchestrates the prompt creation process
- `InitialPromptStep`: Component for entering the initial prompt
- `RefinePromptStep`: Component for refining the prompt with AI assistance
- `FeedbackStep`: Component for providing feedback on the refined prompt
- `ExportStep`: Component for exporting the final prompt

## API Routes

- `/api/ai`: Handles AI-powered prompt refinement and completion

## Styling

This project uses Tailwind CSS for styling. The main configuration can be found in `tailwind.config.ts`.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).
