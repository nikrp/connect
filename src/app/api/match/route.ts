import { NextResponse } from "next/server";

type Project = {
    id: string;
    title: string;
    skillsNeeded: string[]; // e.g. ["bio", "ai", "math"]
  };
  
  type User = {
    id: string;
    name: string;
    skills: string[]; // e.g. ["ai", "math", "web"]
  };
  
  // Scoring function: returns value between 0 and 1
  function matchScore(userSkills: string[], projectSkills: string[]): number {
    const userSet = new Set(userSkills);
    const matches = projectSkills.filter(skill => userSet.has(skill));
    return matches.length / projectSkills.length;
  }
  
  // Main matcher
  function matchProjectsToUser(user: User, projects: Project[], threshold = 0.3) {
    return projects
      .map(project => ({
        ...project,
        score: matchScore(user.skills, project.skillsNeeded)
      }))
      .filter(p => p.score >= threshold) // Filter out bad matches
      .sort((a, b) => b.score - a.score); // Sort by best match
  }

  
  export async function POST(request: Request) {
    const { projects, userData } = await request.json();
    const matches = matchProjectsToUser(userData, projects);
    console.log(matches)

    return NextResponse.json(matches, { status: 200 });
  }