"use client"

import { useEffect } from "react"
import axios from "axios";

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

export default function Create() {

    const user: User = {
        id: "u123",
        name: "Nikhil",
        skills: ["bio", "ml", "startup"],
      };
      
      const projects: Project[] = [
        { id: "p1", title: "Cancer Detection AI", skillsNeeded: ["bio", "ai"] },
        { id: "p2", title: "Math Club Website", skillsNeeded: ["web", "react"] },
        { id: "p3", title: "ML + Bio Study", skillsNeeded: ["bio", "ml"] },
      ];
      
    
    useEffect(() => {
        async function getMatches() {
            const response = await axios.post("/api/match", { projects: projects, userData: user })
            console.log(response.data);
        }

        getMatches()
    }, []);

    return (
        <div></div>
    )
}