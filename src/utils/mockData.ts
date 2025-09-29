/**
 * This file provides mock data for development or when the database connection is not available
 */

export const mockClients = [
  {
    id: 1,
    name: "Red Digital",
    contact_person: "Jane Smith",
    email: "jane@reddigital.com",
    phone: "123-456-7890",
    status: "active",
    industry: "Technology",
    type: "Agency",
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    name: "Acme Corp",
    contact_person: "John Doe",
    email: "john@acmecorp.com",
    phone: "098-765-4321",
    status: "pending",
    industry: "Manufacturing",
    type: "Enterprise",
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    name: "Sunshine Media",
    contact_person: "Alice Johnson",
    email: "alice@sunshinemedia.com",
    phone: "555-123-4567",
    status: "active",
    industry: "Media",
    type: "Startup",
    created_at: new Date().toISOString()
  },
  {
    id: 4,
    name: "Global Services Inc",
    contact_person: "Bob Williams",
    email: "bob@globalservices.com",
    phone: "555-987-6543",
    status: "inactive",
    industry: "Consulting",
    type: "Enterprise",
    created_at: new Date().toISOString()
  }
];

export const mockNewsItems = [
  {
    id: 1,
    title: "OpenAI Releases GPT-5 with Advanced Reasoning Capabilities",
    source: "TechCrunch",
    summary: "OpenAI has released GPT-5, featuring substantially improved reasoning and planning capabilities. The new model demonstrates enhanced abilities in complex problem-solving, long-context understanding, and multimodal reasoning.",
    url: "https://example.com/openai-gpt5",
    category: "Large Language Models",
    image_url: "https://picsum.photos/seed/openai/800/400",
    published_date: new Date().toISOString(),
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    title: "Google Unveils New AI Hardware Accelerator",
    source: "The Verge",
    summary: "Google has announced a new custom AI chip designed to accelerate transformer models. The TPU v6 promises 3x performance and 2x energy efficiency compared to previous generation hardware.",
    url: "https://example.com/google-tpu-v6",
    category: "AI Hardware",
    image_url: "https://picsum.photos/seed/google/800/400",
    published_date: new Date().toISOString(),
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    title: "DeepMind Achieves Breakthrough in Protein Structure Prediction",
    source: "Nature",
    summary: "DeepMind researchers have announced a significant advancement in protein structure prediction. Their new model can predict structures with near-experimental accuracy for a wider range of proteins than ever before.",
    url: "https://example.com/deepmind-protein",
    category: "Scientific Research",
    image_url: "https://picsum.photos/seed/deepmind/800/400",
    published_date: new Date().toISOString(),
    created_at: new Date().toISOString()
  },
  {
    id: 4,
    title: "Meta Introduces New Multimodal AI System",
    source: "VentureBeat",
    summary: "Meta has unveiled a new multimodal AI system capable of understanding and generating text, images, and video simultaneously. The system demonstrates impressive capabilities in creative tasks and content generation.",
    url: "https://example.com/meta-multimodal",
    category: "Multimodal AI",
    image_url: "https://picsum.photos/seed/meta/800/400",
    published_date: new Date().toISOString(),
    created_at: new Date().toISOString()
  },
  {
    id: 5,
    title: "AI Safety Researchers Publish New Framework for Model Evaluation",
    source: "AI Alignment Forum",
    summary: "A team of AI safety researchers has published a comprehensive framework for evaluating large language model safety. The approach introduces novel metrics for measuring truthfulness, harmlessness, and alignment.",
    url: "https://example.com/ai-safety-framework",
    category: "AI Safety",
    image_url: "https://picsum.photos/seed/safety/800/400",
    published_date: new Date().toISOString(),
    created_at: new Date().toISOString()
  }
];

export default {
  clients: mockClients,
  newsItems: mockNewsItems
};