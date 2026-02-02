import type { ProjectBrief } from "../state/types";

export type Template = {
  id: string;
  name: string;
  description: string;
  title: string;
  content: string;
  brief: Partial<ProjectBrief>;
};

export const templates: Template[] = [
  {
    id: "product-update",
    name: "Product Update Memo",
    description: "Monthly update for product and marketing teams.",
    title: "Product Update: [Month YYYY]",
    content: `# Product Update: [Month YYYY]

## Executive Summary
- What changed this month in 2-3 bullets.

## What Shipped
- Feature or improvement
- Customer impact

## Metrics & Signals
- Adoption, retention, revenue, or NPS deltas

## Risks & Mitigations
- Known issues and next steps

## Next Month Focus
- Top 3 priorities
`,
    brief: {
      audience: "Product and marketing teams",
      goal: "Share what shipped, why it matters, and the next priorities.",
      tone: "Clear, confident, and concise",
      length: 650,
      keyPoints: ["What shipped", "Impact metrics", "Next priorities"],
      constraints: "Keep it scannable, use bullets, avoid jargon."
    }
  },
  {
    id: "launch-announcement",
    name: "Launch Announcement",
    description: "External launch or release note for customers.",
    title: "Introducing [Product/Feature Name]",
    content: `# Introducing [Product/Feature Name]

## The Problem
Describe the pain or friction your audience faces.

## The Solution
Explain the new capability and what it unlocks.

## How It Works
- Step 1
- Step 2
- Step 3

## Why It Matters
Proof points, results, or expected outcomes.

## Get Started
Call to action and next step.
`,
    brief: {
      audience: "Existing and prospective customers",
      goal: "Explain the launch and drive adoption.",
      tone: "Confident, energetic, and clear",
      length: 750,
      keyPoints: ["Problem", "Solution", "CTA"],
      constraints: "Lead with benefits before features."
    }
  },
  {
    id: "strategy-brief",
    name: "Strategy Brief",
    description: "Decision memo for leadership alignment.",
    title: "Strategy Brief: [Topic]",
    content: `# Strategy Brief: [Topic]

## Context
What changed and why this decision matters now.

## Recommendation
State the decision and rationale.

## Options Considered
- Option A
- Option B
- Option C

## Risks
What could go wrong and how we mitigate.

## Decision Needed
Who decides and by when.
`,
    brief: {
      audience: "Leadership team",
      goal: "Align on a decision with clear options and tradeoffs.",
      tone: "Analytical, direct, and structured",
      length: 900,
      keyPoints: ["Context", "Recommendation", "Risks"],
      constraints: "Focus on decision clarity over background detail."
    }
  },
  {
    id: "case-study",
    name: "Customer Story",
    description: "Storytelling template for a customer win.",
    title: "Customer Story: [Customer Name]",
    content: `# Customer Story: [Customer Name]

## Snapshot
- Industry
- Company size
- Use case

## The Challenge
What the customer struggled with.

## The Solution
How they used the product to solve it.

## Results
Quantified outcomes and wins.

## Quote
Insert a customer quote or testimonial.
`,
    brief: {
      audience: "Prospective customers",
      goal: "Show real outcomes and build trust.",
      tone: "Warm, credible, and benefits-focused",
      length: 800,
      keyPoints: ["Challenge", "Solution", "Results"],
      constraints: "Anchor every claim in a specific outcome."
    }
  }
];

export const getTemplateById = (id: string): Template | undefined =>
  templates.find((template) => template.id === id);
