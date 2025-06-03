// MCP Tools Configuration
export const mcpTools = [
  {
    name: "conduct_interview",
    description: "Initiate a voice call to conduct an interview with a candidate",
    inputSchema: {
      type: "object",
      properties: {
        candidatePhone: {
          type: "string",
          description: "Phone number of the candidate to interview (in E.164 format)"
        },
        candidateName: {
          type: "string",
          description: "Name of the candidate being interviewed"
        },
        position: {
          type: "string",
          description: "Position the candidate is applying for"
        },
        interviewQuestions: {
          type: "array",
          items: {
            type: "string"
          },
          description: "List of interview questions to ask the candidate"
        }
      },
      required: ["candidatePhone", "candidateName", "position", "interviewQuestions"]
    }
  },
  {
    name: "notify_interview_result",
    description: "Call a candidate to inform them about their interview results",
    inputSchema: {
      type: "object",
      properties: {
        candidatePhone: {
          type: "string",
          description: "Phone number of the candidate (in E.164 format)"
        },
        candidateName: {
          type: "string",
          description: "Name of the candidate"
        },
        position: {
          type: "string",
          description: "Position they interviewed for"
        },
        result: {
          type: "string",
          enum: ["accepted", "rejected", "next_round"],
          description: "Interview result"
        },
        message: {
          type: "string",
          description: "Additional message or feedback for the candidate"
        }
      },
      required: ["candidatePhone", "candidateName", "position", "result"]
    }
  },
  {
    name: "discuss_job_opening",
    description: "Call a potential candidate to discuss job opportunities",
    inputSchema: {
      type: "object",
      properties: {
        candidatePhone: {
          type: "string",
          description: "Phone number of the potential candidate (in E.164 format)"
        },
        candidateName: {
          type: "string",
          description: "Name of the potential candidate"
        },
        position: {
          type: "string",
          description: "Job position to discuss"
        },
        companyInfo: {
          type: "string",
          description: "Brief information about the company and role"
        },
        nextSteps: {
          type: "string",
          description: "Next steps if candidate is interested"
        }
      },
      required: ["candidatePhone", "candidateName", "position", "companyInfo"]
    }
  },
  {
    name: "get_call_status",
    description: "Get the status of active voice calls",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "check_twilio_config",
    description: "Check Twilio configuration and service status",
    inputSchema: {
      type: "object",
      properties: {}
    }
  }
];
