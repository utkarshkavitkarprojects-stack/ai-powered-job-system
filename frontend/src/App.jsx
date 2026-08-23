import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

const API_URL = "http://127.0.0.1:8000";

// ============================================================
// COMMON / HIGH-DEMAND SKILLS
// ============================================================

const COMMON_SKILLS = [
  "Python",
  "SQL",
  "R",
  "Java",
  "C++",
  "C#",
  "JavaScript",
  "TypeScript",
  "HTML",
  "CSS",

  "Machine Learning",
  "Deep Learning",
  "Artificial Intelligence",
  "Generative AI",
  "Natural Language Processing",
  "Computer Vision",
  "LLM",
  "Large Language Models",
  "RAG",
  "Prompt Engineering",
  "LangChain",
  "LlamaIndex",

  "TensorFlow",
  "PyTorch",
  "Keras",
  "Scikit-learn",
  "XGBoost",
  "LightGBM",
  "OpenCV",

  "Pandas",
  "NumPy",
  "Matplotlib",
  "Seaborn",

  "Power BI",
  "Tableau",
  "Excel",
  "Data Visualization",
  "Statistics",
  "A/B Testing",

  "AWS",
  "Azure",
  "Google Cloud",
  "Docker",
  "Kubernetes",
  "Git",
  "GitHub",
  "CI/CD",

  "FastAPI",
  "Flask",
  "Django",
  "REST API",

  "Apache Spark",
  "PySpark",
  "Databricks",
  "Hadoop",

  "PostgreSQL",
  "MySQL",
  "MongoDB",
  "SQLite",
  "Redis",

  "ETL",
  "Data Engineering",
  "Data Analysis",
  "Business Intelligence",
  "MLOps",
  "MLflow",
  "Airflow",

  "Neural Networks",
  "Regression",
  "Classification",
  "Clustering",
  "Time Series",
  "Feature Engineering",
  "Predictive Modeling",

  "NLP",
  "BERT",
  "Transformers",
  "Hugging Face",
  "OpenAI",
  "Gemini",
  "Claude",

  "Agile",
  "JIRA",
  "GitLab",
];

// ============================================================
// APP
// ============================================================

function App() {
  // ==========================================================
  // NORMAL JOB SEARCH STATE
  // ==========================================================

  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [selectedSource, setSelectedSource] = useState("all");
  const [selectedSkill, setSelectedSkill] = useState("");
  const [selectedEmploymentType, setSelectedEmploymentType] =
    useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");

  const [sourceSearch, setSourceSearch] = useState("");
  const [skillSearch, setSkillSearch] = useState("");
  const [employmentTypeSearch, setEmploymentTypeSearch] =
    useState("");
  const [locationSearch, setLocationSearch] = useState("");

  const [sourceOpen, setSourceOpen] = useState(false);
  const [skillOpen, setSkillOpen] = useState(false);
  const [employmentTypeOpen, setEmploymentTypeOpen] =
    useState(false);
  const [locationOpen, setLocationOpen] = useState(false);

  const [sources, setSources] = useState([]);
  const [jobs, setJobs] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);

  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);

  const [selectedJob, setSelectedJob] = useState(null);
  const [loadingJob, setLoadingJob] = useState(false);

  const sourceRef = useRef(null);
  const skillRef = useRef(null);
  const employmentTypeRef = useRef(null);
  const locationRef = useRef(null);

  // ==========================================================
  // APPLICATION MODE
  // ==========================================================

  const [activeMode, setActiveMode] = useState("jobs");

  // jobs
  // recommendations
  // assistant

  // ==========================================================
  // RESUME / AI STATE
  // ==========================================================

  const [resumeFile, setResumeFile] = useState(null);
  const [resumeProfile, setResumeProfile] = useState(null);

  const [resumeUploading, setResumeUploading] = useState(false);
  const [resumeError, setResumeError] = useState("");
  const [resumeSuccess, setResumeSuccess] = useState("");

  // ==========================================================
  // RECOMMENDATIONS
  // ==========================================================

  const [recommendations, setRecommendations] = useState([]);
  const [recommendationsLoading, setRecommendationsLoading] =
    useState(false);
  const [recommendationsError, setRecommendationsError] =
    useState("");

  // ==========================================================
  // ASSISTANT
  // ==========================================================

  const [assistantInput, setAssistantInput] = useState("");
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [assistantMessages, setAssistantMessages] = useState([]);
  const [assistantLoading, setAssistantLoading] = useState(false);
  const [assistantError, setAssistantError] = useState("");

  // ==========================================================
  // COMMON
  // ==========================================================

  const hasSearched = searchTerm.trim() !== "";

  // ==========================================================
  // FILTER SOURCE OPTIONS
  // ==========================================================

  const filteredSources = useMemo(() => {
    const value = sourceSearch.trim().toLowerCase();

    if (!value) {
      return sources;
    }

    return sources.filter((source) =>
      source.toLowerCase().includes(value)
    );
  }, [sources, sourceSearch]);

  // ==========================================================
  // FILTER SKILL OPTIONS
  // ==========================================================

  const filteredSkills = useMemo(() => {
    const value = skillSearch.trim().toLowerCase();

    if (!value) {
      return COMMON_SKILLS;
    }

    return COMMON_SKILLS.filter((skill) =>
      skill.toLowerCase().includes(value)
    );
  }, [skillSearch]);

  const employmentTypes = useMemo(() => {
    const defaults = [
      "Full-time",
      "Part-time",
      "Internship",
      "Contract",
      "Freelance",
    ];
    const fromJobs = jobs
      .map((job) => job.employmentType)
      .filter(Boolean);

    return [...new Set([...defaults, ...fromJobs])];
  }, [jobs]);

  const locations = useMemo(() => {
    const defaults = [
      "Remote",
      "Hybrid",
      "Pune",
      "Bangalore",
      "Mumbai",
      "Delhi NCR",
    ];
    const fromJobs = jobs
      .map((job) => job.location)
      .filter(Boolean);

    return [...new Set([...defaults, ...fromJobs])];
  }, [jobs]);

  const filteredEmploymentTypes = useMemo(() => {
    const value = employmentTypeSearch
      .trim()
      .toLowerCase();

    return employmentTypes.filter((type) =>
      type.toLowerCase().includes(value)
    );
  }, [employmentTypes, employmentTypeSearch]);

  const filteredLocations = useMemo(() => {
    const value = locationSearch.trim().toLowerCase();

    return locations.filter((location) =>
      location.toLowerCase().includes(value)
    );
  }, [locations, locationSearch]);

  const visibleJobs = useMemo(() => {
    return jobs.filter((job) => {
      const employmentMatches =
        selectedEmploymentType === "all" ||
        job.employmentType
          ?.toLowerCase()
          .includes(
            selectedEmploymentType.toLowerCase()
          );
      const jobLocation = (job.location || "")
        .toLowerCase();
      const selectedLocationValue = selectedLocation
        .toLowerCase();
      const locationMatches =
        selectedLocation === "all" ||
        jobLocation.includes(selectedLocationValue) ||
        (selectedLocationValue === "bangalore" &&
          /bangal|bengal/.test(jobLocation));

      return employmentMatches && locationMatches;
    });
  }, [jobs, selectedEmploymentType, selectedLocation]);

  // ==========================================================
  // CLOSE DROPDOWNS
  // ==========================================================

  useEffect(() => {
    function handleOutsideClick(event) {
      if (
        sourceRef.current &&
        !sourceRef.current.contains(event.target)
      ) {
        setSourceOpen(false);
      }

      if (
        skillRef.current &&
        !skillRef.current.contains(event.target)
      ) {
        setSkillOpen(false);
      }

      if (
        employmentTypeRef.current &&
        !employmentTypeRef.current.contains(event.target)
      ) {
        setEmploymentTypeOpen(false);
      }

      if (
        locationRef.current &&
        !locationRef.current.contains(event.target)
      ) {
        setLocationOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  // ==========================================================
  // LOAD SOURCES
  // ==========================================================

  useEffect(() => {
    async function loadSources() {
      try {
        const response = await fetch(`${API_URL}/sources`);

        if (!response.ok) {
          throw new Error("Unable to load sources");
        }

        const data = await response.json();

        setSources(data.sources || []);
      } catch (err) {
        console.error(err);
      }
    }

    loadSources();
  }, []);

  // ==========================================================
  // SEARCH JOBS
  // ==========================================================

  async function fetchJobs(
    requestedPage = 1,
    currentSearch = searchTerm,
    currentSource = selectedSource,
    currentSkill = selectedSkill
  ) {
    if (!currentSearch.trim()) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();

      params.set("search", currentSearch.trim());
      params.set("limit", "20");
      params.set(
        "offset",
        String((requestedPage - 1) * 20)
      );

      if (
        currentSource &&
        currentSource !== "all"
      ) {
        params.set("source", currentSource);
      }

      if (currentSkill) {
        params.set("skill", currentSkill.trim());
      }

      const response = await fetch(
        `${API_URL}/jobs?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error("Failed to retrieve jobs");
      }

      const data = await response.json();

      setJobs(data.jobs || []);
      setHasNext(Boolean(data.has_next));
      setHasPrevious(Boolean(data.has_previous));
      setPage(data.page || requestedPage);
    } catch (err) {
      console.error(err);

      setError(
        "Unable to load jobs. Please check that the backend is running."
      );

      setJobs([]);
      setHasNext(false);
      setHasPrevious(false);
    } finally {
      setLoading(false);
    }
  }

  // ==========================================================
  // MAIN SEARCH
  // ==========================================================

  function handleSearch(event) {
    event.preventDefault();

    const value = searchInput.trim();

    if (!value) {
      return;
    }

    setSearchTerm(value);
    setPage(1);

    fetchJobs(
      1,
      value,
      selectedSource,
      selectedSkill
    );

    setActiveMode("jobs");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // ==========================================================
  // SOURCE SEARCH
  // ==========================================================

  function handleSourceInput(event) {
    const value = event.target.value;

    setSourceSearch(value);
    setSourceOpen(true);
  }

  // ==========================================================
  // SOURCE SELECT
  // ==========================================================

  function handleSourceSelect(source) {
    setSelectedSource(source);

    setSourceSearch(
      source === "all" ? "" : source
    );

    setSourceOpen(false);

    if (!searchTerm.trim()) {
      return;
    }

    setPage(1);

    fetchJobs(
      1,
      searchTerm,
      source,
      selectedSkill
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // ==========================================================
  // SOURCE KEYBOARD
  // ==========================================================

  function handleSourceKeyDown(event) {
    if (event.key === "Escape") {
      setSourceOpen(false);
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();

      const value = sourceSearch.trim();

      if (!value) {
        handleSourceSelect("all");
        return;
      }

      const exactSource = sources.find(
        (source) =>
          source.toLowerCase() ===
          value.toLowerCase()
      );

      if (exactSource) {
        handleSourceSelect(exactSource);
      }
    }
  }

  // ==========================================================
  // SKILL SEARCH
  // ==========================================================

  function handleSkillInput(event) {
    const value = event.target.value;

    setSkillSearch(value);
    setSkillOpen(true);
  }

  // ==========================================================
  // SKILL SELECT
  // ==========================================================

  function handleSkillSelect(skill) {
    const value = skill.trim();

    setSelectedSkill(value);
    setSkillSearch(value);
    setSkillOpen(false);

    if (!searchTerm.trim()) {
      return;
    }

    setPage(1);

    fetchJobs(
      1,
      searchTerm,
      selectedSource,
      value
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // ==========================================================
  // CUSTOM SKILL
  // ==========================================================

  function applyCustomSkill() {
    const value = skillSearch.trim();

    if (!value) {
      return;
    }

    handleSkillSelect(value);
  }

  // ==========================================================
  // SKILL KEYBOARD
  // ==========================================================

  function handleSkillKeyDown(event) {
    if (event.key === "Escape") {
      setSkillOpen(false);
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();

      const value = skillSearch.trim();

      if (!value) {
        return;
      }

      const exactSkill = COMMON_SKILLS.find(
        (skill) =>
          skill.toLowerCase() ===
          value.toLowerCase()
      );

      if (exactSkill) {
        handleSkillSelect(exactSkill);
      } else {
        applyCustomSkill();
      }
    }
  }

  // ==========================================================
  // CLEAR SOURCE
  // ==========================================================

  function clearSourceFilter() {
    handleSourceSelect("all");
  }

  // ==========================================================
  // CLEAR SKILL
  // ==========================================================

  function clearSkillFilter() {
    setSelectedSkill("");
    setSkillSearch("");
    setSkillOpen(false);

    if (!searchTerm.trim()) {
      return;
    }

    setPage(1);

    fetchJobs(
      1,
      searchTerm,
      selectedSource,
      ""
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // ==========================================================
  // EMPLOYMENT TYPE FILTER
  // ==========================================================

  function handleEmploymentTypeSelect(type) {
    setSelectedEmploymentType(type);
    setEmploymentTypeSearch(
      type === "all" ? "" : type
    );
    setEmploymentTypeOpen(false);
  }

  function clearEmploymentTypeFilter() {
    handleEmploymentTypeSelect("all");
  }

  function handleEmploymentTypeKeyDown(event) {
    if (event.key === "Escape") {
      setEmploymentTypeOpen(false);
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const value = employmentTypeSearch.trim();
      const match = employmentTypes.find(
        (type) =>
          type.toLowerCase() === value.toLowerCase()
      );

      if (match) {
        handleEmploymentTypeSelect(match);
      }
    }
  }

  // ==========================================================
  // LOCATION FILTER
  // ==========================================================

  function handleLocationSelect(location) {
    setSelectedLocation(location);
    setLocationSearch(
      location === "all" ? "" : location
    );
    setLocationOpen(false);
  }

  function clearLocationFilter() {
    handleLocationSelect("all");
  }

  function handleLocationKeyDown(event) {
    if (event.key === "Escape") {
      setLocationOpen(false);
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const value = locationSearch.trim();
      const match = locations.find(
        (location) =>
          location.toLowerCase() === value.toLowerCase()
      );

      if (match) {
        handleLocationSelect(match);
      }
    }
  }

  // ==========================================================
  // PAGINATION
  // ==========================================================

  function goToNextPage() {
    if (!hasNext || loading) {
      return;
    }

    const nextPage = page + 1;

    fetchJobs(
      nextPage,
      searchTerm,
      selectedSource,
      selectedSkill
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function goToPreviousPage() {
    if (!hasPrevious || loading) {
      return;
    }

    const previousPage = page - 1;

    fetchJobs(
      previousPage,
      searchTerm,
      selectedSource,
      selectedSkill
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // ==========================================================
  // VIEW JOB
  // ==========================================================

  async function handleViewJob(jobId) {
    setLoadingJob(true);
    setSelectedJob(null);

    try {
      const response = await fetch(
        `${API_URL}/jobs/${encodeURIComponent(jobId)}`
      );

      if (!response.ok) {
        throw new Error("Unable to load job");
      }

      const job = await response.json();

      setSelectedJob(job);
    } catch (err) {
      console.error(err);

      setError("Unable to load job details.");
    } finally {
      setLoadingJob(false);
    }
  }

  // ==========================================================
  // RESUME FILE SELECT
  // ==========================================================

  function handleResumeFileChange(event) {
    const file = event.target.files?.[0];

    setResumeError("");
    setResumeSuccess("");

    if (!file) {
      return;
    }

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setResumeError(
        "Only PDF resumes are supported."
      );
      setResumeFile(null);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setResumeError(
        "Resume must be smaller than 10MB."
      );
      setResumeFile(null);
      return;
    }

    setResumeFile(file);
  }

  // ==========================================================
  // UPLOAD + ANALYZE RESUME
  // ==========================================================

  async function handleResumeUpload() {
    if (!resumeFile) {
      setResumeError(
        "Please select a PDF resume first."
      );
      return;
    }

    setResumeUploading(true);
    setResumeError("");
    setResumeSuccess("");

    try {
      const formData = new FormData();

      formData.append("file", resumeFile);

      const response = await fetch(
        `${API_URL}/resume/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Resume upload failed."
        );
      }

      setResumeProfile(
        data.profile || null
      );

      setResumeSuccess(
        data.message ||
          "Resume uploaded successfully."
      );
    } catch (err) {
      console.error(err);

      setResumeError(
        err.message ||
          "Unable to upload resume."
      );
    } finally {
      setResumeUploading(false);
    }
  }

  // ==========================================================
  // GENERATE RECOMMENDATIONS
  // ==========================================================

  async function fetchRecommendations() {
    if (!resumeProfile) {
      setRecommendationsError(
        "Upload your resume first."
      );
      return;
    }

    setRecommendationsLoading(true);
    setRecommendationsError("");

    try {
      const response = await fetch(
        `${API_URL}/recommendations`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            profile: resumeProfile,
            limit: 20,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Unable to generate recommendations."
        );
      }

      setRecommendations(
        data.recommendations || []
      );
    } catch (err) {
      console.error(err);

      setRecommendationsError(
        err.message ||
          "Unable to generate recommendations."
      );
    } finally {
      setRecommendationsLoading(false);
    }
  }

  // ==========================================================
  // OPEN RECOMMENDATIONS MODE
  // ==========================================================

  function openRecommendations() {
    setActiveMode("recommendations");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    if (resumeProfile) {
      fetchRecommendations();
    }
  }

  // ==========================================================
  // ASSISTANT MESSAGE
  // ==========================================================

  async function sendAssistantMessage(event) {
    if (event) {
      event.preventDefault();
    }

    const message =
      assistantInput.trim();

    const apiKey =
      geminiApiKey.trim();

    if (!message) {
      return;
    }

    if (!apiKey) {
      setAssistantError(
        "Enter your Gemini API key to use the AI Assistant."
      );
      return;
    }

    setAssistantError("");
    setAssistantLoading(true);

    const userMessage = {
      role: "user",
      content: message,
    };

    setAssistantMessages(
      (previous) => [
        ...previous,
        userMessage,
      ]
    );

    setAssistantInput("");

    try {
      const response = await fetch(
        `${API_URL}/assistant`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            api_key: apiKey,
            message,
            profile:
              resumeProfile || null,
            job_id:
              selectedJob?.job_id || null,
            compare_job_id: null,
            limit: 8,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Assistant request failed."
        );
      }

      setAssistantMessages(
        (previous) => [
          ...previous,
          {
            role: "assistant",
            content:
              data.message ||
              "I couldn't generate a response.",
          },
        ]
      );
    } catch (err) {
      console.error(err);

      setAssistantError(
        err.message ||
          "Unable to contact the AI Assistant."
      );
    } finally {
      setAssistantLoading(false);
    }
  }

  // ==========================================================
  // AI SUITABILITY
  // ==========================================================

  async function handleSuitability() {
    if (!selectedJob) {
      return;
    }

    const job = selectedJob;

    setSelectedJob(null);
    setActiveMode("assistant");

    const apiKey =
      geminiApiKey.trim();

    if (!apiKey) {
      setAssistantError(
        "Enter your Gemini API key to analyze your suitability."
      );
      return;
    }

    setAssistantLoading(true);
    setAssistantError("");

    const message =
      "Am I suitable for this job? Analyze my fit based on my uploaded resume, including strengths, gaps, experience alignment, and what I should improve before applying.";

    setAssistantMessages(
      (previous) => [
        ...previous,
        {
          role: "user",
          content: message,
        },
      ]
    );

    try {
      const response = await fetch(
        `${API_URL}/assistant/suitability`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            api_key: apiKey,
            message,
            profile:
              resumeProfile || null,
            job_id:
              job.job_id,
            limit: 8,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Suitability analysis failed."
        );
      }

      setAssistantMessages(
        (previous) => [
          ...previous,
          {
            role: "assistant",
            content:
              data.message ||
              "Unable to generate suitability analysis.",
          },
        ]
      );
    } catch (err) {
      console.error(err);

      setAssistantError(
        err.message ||
          "Unable to generate suitability analysis."
      );
    } finally {
      setAssistantLoading(false);
    }
  }

  // ==========================================================
  // NAVIGATION HELPERS
  // ==========================================================

  function openJobsMode() {
    setActiveMode("jobs");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function openAssistantMode() {
    setActiveMode("assistant");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="app">

      {/* ======================================================
          NAVBAR
      ====================================================== */}

      <nav className="navbar app-navbar">

        <div
          className="brand"
          onClick={openJobsMode}
          style={{ cursor: "pointer" }}
        >
          <div className="brand-icon">
            ✦
          </div>

          <span>
            CareerAI
          </span>
        </div>

        <div className="nav-links">

          <a
            href="#jobs"
            aria-current={
              activeMode === "jobs"
                ? "page"
                : undefined
            }
            style={{
              color:
                activeMode === "jobs"
                  ? "#0f172a"
                  : undefined,
              fontWeight:
                activeMode === "jobs"
                  ? 700
                  : undefined,
            }}
            onClick={(event) => {
              event.preventDefault();
              openJobsMode();
            }}
          >
            Jobs
          </a>

          <a
            href="#recommended"
            aria-current={
              activeMode === "recommendations"
                ? "page"
                : undefined
            }
            style={{
              color:
                activeMode === "recommendations"
                  ? "#0f172a"
                  : undefined,
              fontWeight:
                activeMode === "recommendations"
                  ? 700
                  : undefined,
            }}
            onClick={(event) => {
              event.preventDefault();
              openRecommendations();
            }}
          >
            AI Recommendations
          </a>

          <a
            href="#assistant"
            aria-current={
              activeMode === "assistant"
                ? "page"
                : undefined
            }
            style={{
              color:
                activeMode === "assistant"
                  ? "#0f172a"
                  : undefined,
              fontWeight:
                activeMode === "assistant"
                  ? 700
                  : undefined,
            }}
            onClick={(event) => {
              event.preventDefault();
              openAssistantMode();
            }}
          >
            AI Assistant
          </a>

        </div>

        <span className="status-badge">
          <span className="status-dot" />
          Status: Ready
        </span>

      </nav>


      {/* ======================================================
          HERO
      ====================================================== */}

      {activeMode === "jobs" && (

      <section className="hero">

        <div className="hero-content">

          <span className="hero-badge">
            <span className="hero-badge-dot" />
            AI-POWERED CAREER COPILOT
          </span>

          <h1>
            Land the Role You
            <br />

            <span>
              Were Built For
            </span>
          </h1>

          <p>
            Real-time job aggregation and AI-driven
            skill gap analysis designed to accelerate
            your application process.
          </p>

          <form
            className="search-container"
            onSubmit={handleSearch}
          >

            <div className="search-box">

              <span className="search-icon">
                ⌕
              </span>

              <input
                type="text"
                placeholder="Search jobs, skills, companies..."
                value={searchInput}
                onChange={(event) =>
                  setSearchInput(
                    event.target.value
                  )
                }
              />

              {searchInput && (
                <button
                  type="button"
                  className="search-clear"
                  aria-label="Clear search"
                  onClick={() =>
                    setSearchInput("")
                  }
                >
                  ×
                </button>
              )}

            </div>

            <button
              type="submit"
              className="search-button"
              disabled={loading}
            >
              {loading
                ? "Searching..."
                : "Search Jobs"}
            </button>

          </form>

          <div className="quick-filters">
            {["Remote", "Data Science", "Full-time", "Hybrid"].map(
              (filter) => (
                <button
                  type="button"
                  key={filter}
                  onClick={() =>
                    setSearchInput(filter)
                  }
                >
                  {filter}
                </button>
              )
            )}
          </div>

        </div>

      </section>

      )}


      {/* ======================================================
          NORMAL JOB MODE
      ====================================================== */}

      {activeMode === "jobs" && (

        <section
          className="jobs-section"
          id="jobs"
        >

          {!hasSearched ? (

            <div className="empty-search">

              <h2>
                Search for your next opportunity
              </h2>

              <p>
                Enter a job title, skill,
                company, or keyword above
                to find relevant jobs.
              </p>

            </div>

          ) : (

            <>

              <div className="section-header">

                <div>

                  <h2>
                    Search results
                  </h2>

                  {loading && (
                    <p>
                      Finding relevant jobs...
                    </p>
                  )}

                </div>

                <span className="job-count">
                  {visibleJobs.length} shown
                </span>

              </div>


              {/* FILTERS */}

              <div className="active-filters">

                {/* SOURCE */}

                <div
                  className="filter-dropdown"
                  ref={sourceRef}
                >

                  <div
                    className="filter-control"
                    onClick={() =>
                      setSourceOpen(true)
                    }
                  >

                    <span className="filter-icon">
                      ◉
                    </span>

                    <input
                      type="text"
                      className="filter-input"
                      placeholder="Search sources..."
                      value={sourceSearch}
                      onChange={
                        handleSourceInput
                      }
                      onFocus={() =>
                        setSourceOpen(true)
                      }
                      onKeyDown={
                        handleSourceKeyDown
                      }
                      disabled={loading}
                    />

                    {selectedSource !==
                      "all" && (
                      <button
                        type="button"
                        className="filter-clear"
                        onClick={(event) => {
                          event.stopPropagation();
                          clearSourceFilter();
                        }}
                      >
                        ×
                      </button>
                    )}

                    <span className="filter-arrow">
                      ▾
                    </span>

                  </div>

                  {sourceOpen &&
                    !loading && (

                    <div className="filter-menu">

                      <button
                        type="button"
                        className={
                          selectedSource ===
                          "all"
                            ? "filter-option active"
                            : "filter-option"
                        }
                        onClick={() =>
                          handleSourceSelect(
                            "all"
                          )
                        }
                      >
                        All Sources
                      </button>

                      {filteredSources.length >
                      0 ? (

                        filteredSources.map(
                          (source) => (

                            <button
                              type="button"
                              className={
                                selectedSource ===
                                source
                                  ? "filter-option active"
                                  : "filter-option"
                              }
                              key={source}
                              onClick={() =>
                                handleSourceSelect(
                                  source
                                )
                              }
                            >
                              {source}
                            </button>

                          )
                        )

                      ) : (

                        <div className="filter-empty">
                          No matching sources
                        </div>

                      )}

                    </div>

                  )}

                </div>


                {/* SKILL */}

                <div
                  className="filter-dropdown"
                  ref={skillRef}
                >

                  <div
                    className="filter-control"
                    onClick={() =>
                      setSkillOpen(true)
                    }
                  >

                    <span className="filter-icon">
                      ◆
                    </span>

                    <input
                      type="text"
                      className="filter-input"
                      placeholder="Search or type any skill..."
                      value={skillSearch}
                      onChange={
                        handleSkillInput
                      }
                      onFocus={() =>
                        setSkillOpen(true)
                      }
                      onKeyDown={
                        handleSkillKeyDown
                      }
                      disabled={loading}
                    />

                    {selectedSkill && (
                      <button
                        type="button"
                        className="filter-clear"
                        onClick={(event) => {
                          event.stopPropagation();
                          clearSkillFilter();
                        }}
                      >
                        ×
                      </button>
                    )}

                    <span className="filter-arrow">
                      ▾
                    </span>

                  </div>

                  {skillOpen &&
                    !loading && (

                    <div className="filter-menu">

                      <button
                        type="button"
                        className={
                          selectedSkill === ""
                            ? "filter-option active"
                            : "filter-option"
                        }
                        onClick={
                          clearSkillFilter
                        }
                      >
                        All Skills
                      </button>

                      {skillSearch.trim() &&
                        !COMMON_SKILLS.some(
                          (skill) =>
                            skill.toLowerCase() ===
                            skillSearch
                              .trim()
                              .toLowerCase()
                        ) && (

                          <button
                            type="button"
                            className="filter-option custom-skill"
                            onClick={
                              applyCustomSkill
                            }
                          >
                            Search for "
                            {skillSearch.trim()}"
                          </button>

                        )}

                      {filteredSkills.length >
                      0 ? (

                        filteredSkills.map(
                          (skill) => (

                            <button
                              type="button"
                              className={
                                selectedSkill ===
                                skill
                                  ? "filter-option active"
                                  : "filter-option"
                              }
                              key={skill}
                              onClick={() =>
                                handleSkillSelect(
                                  skill
                                )
                              }
                            >
                              {skill}
                            </button>

                          )
                        )

                      ) : (

                        <div className="filter-empty">
                          Press Enter to search for this skill
                        </div>

                      )}

                    </div>

                  )}

                </div>

                {/* EMPLOYMENT TYPE */}

                <div
                  className="filter-dropdown"
                  ref={employmentTypeRef}
                >

                  <div
                    className="filter-control"
                    onClick={() =>
                      setEmploymentTypeOpen(true)
                    }
                  >

                    <span className="filter-icon">
                      Type
                    </span>

                    <input
                      type="text"
                      className="filter-input"
                      placeholder="Employment type..."
                      value={employmentTypeSearch}
                      onChange={(event) => {
                        setEmploymentTypeSearch(
                          event.target.value
                        );
                        setEmploymentTypeOpen(true);
                      }}
                      onFocus={() =>
                        setEmploymentTypeOpen(true)
                      }
                      onKeyDown={
                        handleEmploymentTypeKeyDown
                      }
                      disabled={loading}
                    />

                    {selectedEmploymentType !== "all" && (
                      <button
                        type="button"
                        className="filter-clear"
                        onClick={(event) => {
                          event.stopPropagation();
                          clearEmploymentTypeFilter();
                        }}
                      >
                        ×
                      </button>
                    )}

                    <span className="filter-arrow">▾</span>

                  </div>

                  {employmentTypeOpen && !loading && (
                    <div className="filter-menu">

                      <button
                        type="button"
                        className={
                          selectedEmploymentType === "all"
                            ? "filter-option active"
                            : "filter-option"
                        }
                        onClick={() =>
                          handleEmploymentTypeSelect("all")
                        }
                      >
                        All Employment Types
                      </button>

                      {filteredEmploymentTypes.map((type) => (
                        <button
                          type="button"
                          className={
                            selectedEmploymentType === type
                              ? "filter-option active"
                              : "filter-option"
                          }
                          key={type}
                          onClick={() =>
                            handleEmploymentTypeSelect(type)
                          }
                        >
                          {type}
                        </button>
                      ))}

                    </div>
                  )}

                </div>

                {/* LOCATION */}

                <div
                  className="filter-dropdown"
                  ref={locationRef}
                >

                  <div
                    className="filter-control"
                    onClick={() => setLocationOpen(true)}
                  >

                    <span className="filter-icon">
                      Pin
                    </span>

                    <input
                      type="text"
                      className="filter-input"
                      placeholder="Location..."
                      value={locationSearch}
                      onChange={(event) => {
                        setLocationSearch(event.target.value);
                        setLocationOpen(true);
                      }}
                      onFocus={() => setLocationOpen(true)}
                      onKeyDown={handleLocationKeyDown}
                      disabled={loading}
                    />

                    {selectedLocation !== "all" && (
                      <button
                        type="button"
                        className="filter-clear"
                        onClick={(event) => {
                          event.stopPropagation();
                          clearLocationFilter();
                        }}
                      >
                        ×
                      </button>
                    )}

                    <span className="filter-arrow">▾</span>

                  </div>

                  {locationOpen && !loading && (
                    <div className="filter-menu">

                      <button
                        type="button"
                        className={
                          selectedLocation === "all"
                            ? "filter-option active"
                            : "filter-option"
                        }
                        onClick={() =>
                          handleLocationSelect("all")
                        }
                      >
                        All Locations
                      </button>

                      {filteredLocations.map((location) => (
                        <button
                          type="button"
                          className={
                            selectedLocation === location
                              ? "filter-option active"
                              : "filter-option"
                          }
                          key={location}
                          onClick={() =>
                            handleLocationSelect(location)
                          }
                        >
                          {location}
                        </button>
                      ))}

                    </div>
                  )}

                </div>

              </div>


              {(selectedSource !== "all" ||
                selectedSkill ||
                selectedEmploymentType !== "all" ||
                selectedLocation !== "all") && (

                <div className="active-filter-summary">

                  {selectedSource !==
                    "all" && (
                    <span>
                      Source:{" "}
                      <strong>
                        {selectedSource}
                      </strong>
                    </span>
                  )}

                  {selectedSkill && (
                    <span>
                      Skill:{" "}
                      <strong>
                        {selectedSkill}
                      </strong>
                    </span>
                  )}

                  {selectedEmploymentType !== "all" && (
                    <span>
                      Type: {" "}
                      <strong>
                        {selectedEmploymentType}
                      </strong>
                    </span>
                  )}

                  {selectedLocation !== "all" && (
                    <span>
                      Location: {" "}
                      <strong>
                        {selectedLocation}
                      </strong>
                    </span>
                  )}

                </div>

              )}


              {error && (

                <div className="no-results">

                  <h3>
                    Something went wrong
                  </h3>

                  <p>
                    {error}
                  </p>

                </div>

              )}


              {loading ? (

                <div className="no-results">

                  <h3>
                    Finding relevant jobs...
                  </h3>

                  <p>
                    Searching the job database.
                  </p>

                </div>

              ) : (

                <div className="job-list">

                  {visibleJobs.length > 0 ? (

                    visibleJobs.map(
                      (job) => (

                        <JobCard
                          key={job.job_id}
                          job={job}
                          onViewJob={
                            handleViewJob
                          }
                        />

                      )
                    )

                  ) : (

                    <div className="no-results">

                      <h3>
                        No jobs found
                      </h3>

                      <p>
                        Try another keyword
                        or filter.
                      </p>

                    </div>

                  )}

                </div>

              )}


              {!loading &&
                (hasPrevious ||
                  hasNext) && (

                  <div className="pagination">

                    <button
                      onClick={
                        goToPreviousPage
                      }
                      disabled={
                        !hasPrevious ||
                        loading
                      }
                    >
                      ← Previous
                    </button>

                    <span>
                      Page {page}
                    </span>

                    <button
                      onClick={
                        goToNextPage
                      }
                      disabled={
                        !hasNext ||
                        loading
                      }
                    >
                      Next →
                    </button>

                  </div>

                )}

            </>

          )}

        </section>

      )}


      {/* ======================================================
          AI RECOMMENDATIONS MODE
      ====================================================== */}

      {activeMode ===
        "recommendations" && (

        <section
          className="jobs-section"
          id="recommended"
        >

          <div className="section-header">

            <div>

              <h2>
                AI Recommendations
              </h2>

              <p>
                Upload your resume and let AI
                find the jobs that best match
                your profile.
              </p>

            </div>

            {recommendations.length >
              0 && (
              <span className="job-count">
                {recommendations.length} recommendations
              </span>
            )}

          </div>


          {/* ==================================================
              RESUME UPLOAD
          ================================================== */}

          <div
            id="resume-section"
            className="empty-search resume-upload-card"
          >

            <h2>
              Upload Your Resume
            </h2>

            <p>
              Upload your PDF resume to get
              personalized AI job recommendations.
            </p>

            <div className="resume-dropzone">
              <span className="upload-icon">↑</span>
              <strong>Drop your resume here</strong>
              <span>or choose a PDF from your computer</span>

              <label className="upload-file-trigger">
                Choose PDF
              <input
                type="file"
                accept=".pdf,application/pdf"
                className="resume-file-input"
                onChange={
                  handleResumeFileChange
                }
              />
              </label>

              <span className="file-type-badge">
                PDF · max 5MB
              </span>
            </div>

              <button
                type="button"
                className="search-button resume-upload-button"
                onClick={
                  handleResumeUpload
                }
                disabled={
                  resumeUploading
                }
              >
                {resumeUploading
                  ? "Uploading Resume..."
                  : "Upload Resume"}
              </button>

            {resumeFile && (
              <div className="resume-file-chip">
                <span>{resumeFile.name}</span>
                <strong>✓ Ready</strong>
              </div>
            )}

            {resumeError && (
              <p
                style={{
                  marginTop: "12px",
                }}
              >
                {resumeError}
              </p>
            )}

            {resumeSuccess && (
              <p
                style={{
                  marginTop: "12px",
                }}
              >
                {resumeSuccess}
              </p>
            )}

          </div>


          {/* ==================================================
              GENERATE RECOMMENDATIONS
          ================================================== */}

          {resumeProfile && (

            <div className="recommendations-action">

              <button
                type="button"
                className="view-job-button"
                onClick={
                  fetchRecommendations
                }
                disabled={
                  recommendationsLoading
                }
              >
                {recommendationsLoading
                  ? "Finding Best Matches..."
                  : "Find AI Job Matches →"}
              </button>

            </div>

          )}


          {/* ==================================================
              RECOMMENDATION ERROR
          ================================================== */}

          {recommendationsError && (

            <div className="no-results">

              <h3>
                Recommendation Error
              </h3>

              <p>
                {recommendationsError}
              </p>

            </div>

          )}


          {/* ==================================================
              RECOMMENDATIONS
          ================================================== */}

          {recommendationsLoading ? (

            <div className="no-results">

              <h3>
                Finding your best matches...
              </h3>

              <p>
                The AI recommendation engine
                is scoring available jobs.
              </p>

            </div>

          ) : (

            <div className="job-list">

              {recommendations.length > 0 ? (

                recommendations.map(
                  (recommendation) => (

                    <RecommendationCard
                      key={
                        recommendation.job
                          ?.job_id
                      }
                      recommendation={
                        recommendation
                      }
                      onViewJob={
                        handleViewJob
                      }
                    />

                  )
                )

              ) : (

                resumeProfile ? (

                  <div className="no-results">

                    <h3>
                      No recommendations yet
                    </h3>

                    <p>
                      Click "Find AI Job Matches"
                      to generate your personalized
                      recommendations.
                    </p>

                  </div>

                ) : (

                  <div className="no-results">

                    <h3>
                      Upload your resume first
                    </h3>

                    <p>
                      Upload your resume to generate
                      personalized AI recommendations.
                    </p>

                  </div>

                )

              )}

            </div>

          )}

        </section>

      )}


      {/* ======================================================
          AI ASSISTANT MODE
      ====================================================== */}

      {activeMode === "assistant" && (

        <section
          className="jobs-section"
          id="assistant"
        >

          <div className="section-header">

            <div>

              <h2>
                AI Job Assistant
              </h2>

              <p>
                Ask questions about jobs,
                your resume, suitability,
                skills, or preparation.
              </p>

            </div>

          </div>


          {/* AI CONFIGURATION */}

          <div
            className="assistant-config"
          >

            <details>
              <summary>
                <span className="assistant-config-icon">✦</span>
                <span>
                  Gemini API key
                  <small>
                    {geminiApiKey
                      ? "Connected for this session"
                      : "Required to start chatting"}
                  </small>
                </span>
                <span className="assistant-config-status">
                  {geminiApiKey ? "Ready" : "Set up"}
                </span>
              </summary>

              <div className="assistant-config-body">
                <p>
                  Your key is used only for the current
                  request and is never saved.
                </p>

                <input
                  type="password"
                  placeholder="Paste your Gemini API key"
                  value={geminiApiKey}
                  onChange={(event) =>
                    setGeminiApiKey(
                      event.target.value
                    )
                  }
                  autoComplete="off"
                  disabled={assistantLoading}
                />
              </div>
            </details>

            {resumeProfile && (
              <p
                style={{
                  marginTop: "12px",
                }}
              >
                ✓ Resume profile loaded:
                {" "}
                {resumeProfile.name ||
                  "Candidate"}
              </p>
            )}

          </div>


          {/* SELECTED JOB CONTEXT */}

          {selectedJob && (

            <div
              className="job-card"
              style={{
                marginBottom: "20px",
              }}
            >

              <div className="job-card-top">

                <div>

                  <h3>
                    Assistant context
                  </h3>

                  <p className="company">
                    {selectedJob.title}
                    {" — "}
                    {selectedJob.company_name}
                  </p>

                </div>

                <span className="source-badge">
                  Selected Job
                </span>

              </div>

              <button
                type="button"
                className="view-job-button"
                onClick={
                  handleSuitability
                }
              >
                Analyze My Suitability →
              </button>

            </div>

          )}


          {/* ASSISTANT CHAT */}

          <div className="job-card assistant-chat-shell">

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "15px",
              }}
            >

              {assistantMessages.length ===
                0 && (

                <div className="empty-search">

                  <h3>
                    Ask the AI Assistant
                  </h3>

                  <p>
                    Examples:
                  </p>

                  <p>
                    "Which jobs are best for my resume?"
                  </p>

                  <p>
                    "What skills am I missing?"
                  </p>

                  <p>
                    "Am I suitable for this job?"
                  </p>

                  <p>
                    "How should I prepare for this role?"
                  </p>

                </div>

              )}


              {assistantMessages.map(
                (message, index) => (

                  <div
                    key={index}
                    className={
                      "assistant-message " +
                      (message.role === "user"
                        ? "assistant-message-user"
                        : "assistant-message-ai")
                    }
                  >

                    <div className="assistant-message-label">
                      {message.role ===
                      "user"
                        ? "You"
                        : "CareerAI"}
                    </div>

                    {message.role === "assistant" ? (
                      <AssistantResponse
                        content={message.content}
                      />
                    ) : (
                      <p className="assistant-user-text">
                        {message.content}
                      </p>
                    )}

                  </div>

                )
              )}


              {assistantLoading && (

                <div className="no-results">

                  <h3>
                    AI is thinking...
                  </h3>

                </div>

              )}


              {assistantError && (

                <div className="no-results">

                  <p>
                    {assistantError}
                  </p>

                </div>

              )}


              <form
                onSubmit={
                  sendAssistantMessage
                }
                className="assistant-composer"
              >

                <input
                  type="text"
                  placeholder="Ask about jobs, skills, suitability..."
                  value={assistantInput}
                  onChange={(event) =>
                    setAssistantInput(
                      event.target.value
                    )
                  }
                  disabled={
                    assistantLoading
                  }
                />

                <button
                  type="submit"
                  className="search-button"
                  disabled={
                    assistantLoading ||
                    !assistantInput.trim()
                  }
                >
                  {assistantLoading
                    ? "..."
                    : "Ask AI"}
                </button>

              </form>

              <div className="assistant-prompts">
                {[
                  "Analyze my skill gaps",
                  "How should I prepare for this role?",
                  "Find jobs that suit me",
                ].map((prompt) => (
                  <button
                    type="button"
                    key={prompt}
                    onClick={() =>
                      setAssistantInput(prompt)
                    }
                  >
                    {prompt}
                  </button>
                ))}
              </div>

            </div>

          </div>

        </section>

      )}


      {/* ======================================================
          JOB MODAL
      ====================================================== */}

      {(selectedJob ||
        loadingJob) && (

        <div
          className="modal-overlay"
          onClick={() =>
            setSelectedJob(null)
          }
        >

          <div
            className="job-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {loadingJob ? (

              <div className="modal-loading">
                Loading job details...
              </div>

            ) : (

              <>

                <button
                  className="modal-close"
                  onClick={() =>
                    setSelectedJob(null)
                  }
                >
                  ×
                </button>

                <span className="source-badge">
                  {selectedJob.source}
                </span>

                <h2>
                  {selectedJob.title}
                </h2>

                <h3>
                  {selectedJob.company_name}
                </h3>

                <div className="job-meta">

                  <span>
                    📍{" "}
                    {selectedJob.location}
                  </span>

                  {selectedJob.employmentType && (

                    <span>
                      💼{" "}
                      {
                        selectedJob.employmentType
                      }
                    </span>

                  )}

                </div>

                {selectedJob.skills?.length >
                  0 && (

                  <div className="skills">

                    {selectedJob.skills.map(
                      (skill) => (

                        <span
                          className="skill-tag"
                          key={skill}
                        >
                          {skill}
                        </span>

                      )
                    )}

                  </div>

                )}

                <div className="job-description">

                  <h3>
                    Job Description
                  </h3>

                  <p>
                    {selectedJob.description ||
                      selectedJob.formattedDescription ||
                      "No description available."}
                  </p>

                </div>


                {/* AI SUITABILITY */}

                {resumeProfile && (

                  <button
                    type="button"
                    className="view-job-button"
                    onClick={
                      handleSuitability
                    }
                    style={{
                      marginBottom: "10px",
                    }}
                  >
                    AI Suitability Analysis
                  </button>

                )}


                {/* APPLY */}

                {selectedJob.apply_url ? (

                  <a
                    className="view-job-button"
                    href={
                      selectedJob.apply_url
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Apply Now →
                  </a>

                ) : (

                  <div className="no-apply-link">
                    Apply link not available
                  </div>

                )}

              </>

            )}

          </div>

        </div>

      )}

    </div>
  );
}


// ============================================================
// JOB CARD
// ============================================================

function JobCard({
  job,
  onViewJob,
}) {

  return (

    <article className="job-card job-search-card">

      <div className="job-card-top">

        <div>

          <h3>
            {job.title}
          </h3>

          <p className="company">
            {job.company_name}
          </p>

        </div>

        <span className="source-badge">
          {job.source}
        </span>

      </div>


      <div className="job-meta">

        <span>
          📍 {job.location}
        </span>

        {job.employmentType && (

          <span>
            💼 {job.employmentType}
          </span>

        )}

      </div>


      <div className="skills">

        {job.skills?.slice(
          0,
          5
        ).map(
          (skill) => (

            <span
              className="skill-tag"
              key={skill}
            >
              {skill}
            </span>

          )
        )}

      </div>


      <div className="job-card-bottom">

        <button
          className="view-job-button"
          onClick={() =>
            onViewJob(
              job.job_id
            )
          }
        >
          View Job →
        </button>

      </div>

    </article>
  );
}


// ============================================================
// ASSISTANT RESPONSE FORMATTING
// ============================================================

function renderInlineMarkdown(text) {
  return text
    .split(/(\*\*[^*]+\*\*)/g)
    .filter(Boolean)
    .map((part, index) => {
      if (
        part.startsWith("**") &&
        part.endsWith("**")
      ) {
        return (
          <strong key={index}>
            {part.slice(2, -2)}
          </strong>
        );
      }

      return part;
    });
}

function AssistantResponse({
  content,
}) {
  const blocks = [];
  const lines = String(content || "")
    .replace(/\r\n/g, "\n")
    .split("\n");
  let listItems = [];
  let listType = null;

  function addList() {
    if (!listItems.length) {
      return;
    }

    const List = listType === "ordered" ? "ol" : "ul";

    blocks.push(
      <List
        className="assistant-response-list"
        key={`list-${blocks.length}`}
      >
        {listItems.map((item, index) => (
          <li key={index}>
            {renderInlineMarkdown(item)}
          </li>
        ))}
      </List>
    );

    listItems = [];
    listType = null;
  }

  lines.forEach((rawLine) => {
    const line = rawLine.trim();

    if (!line) {
      addList();
      return;
    }

    const orderedItem = line.match(/^\d+\.\s+(.+)$/);
    const bulletItem = line.match(/^[-*]\s+(.+)$/);

    if (orderedItem || bulletItem) {
      const nextListType = orderedItem
        ? "ordered"
        : "unordered";

      if (listType && listType !== nextListType) {
        addList();
      }

      listType = nextListType;
      listItems.push(
        (orderedItem || bulletItem)[1]
      );
      return;
    }

    addList();

    const heading = line.match(/^#{1,3}\s+(.+)$/);

    blocks.push(
      heading ? (
        <h4
          className="assistant-response-heading"
          key={`block-${blocks.length}`}
        >
          {renderInlineMarkdown(heading[1])}
        </h4>
      ) : (
        <p
          className="assistant-response-paragraph"
          key={`block-${blocks.length}`}
        >
          {renderInlineMarkdown(line)}
        </p>
      )
    );
  });

  addList();

  return (
    <div className="assistant-response">
      {blocks}
    </div>
  );
}


// ============================================================
// RECOMMENDATION CARD
// ============================================================

function RecommendationCard({
  recommendation,
  onViewJob,
}) {

  const job =
    recommendation.job || {};

  const score =
    recommendation.score ??
    recommendation.match_score ??
    0;

  const normalizedScore = Math.max(
    0,
    Math.min(100, Number(score) || 0)
  );

  const reasons =
    recommendation.reasons ||
    recommendation.match_reasons ||
    [];

  const missingSkills =
    recommendation.missing_skills ||
    [];

  return (

    <article className="job-card recommendation-card">

      <div className="job-card-top">

        <div>

          <h3>
            {job.title}
          </h3>

          <p className="company">
            {job.company_name ||
              job.company}
          </p>

        </div>

        <div
          className="recommendation-score"
          style={{
            "--score": normalizedScore,
          }}
        >
          <strong>{score}%</strong>
          <span>Match</span>
        </div>

      </div>


      <div className="job-meta">

        <span>
          📍 {job.location}
        </span>

        {job.employmentType && (

          <span>
            💼 {job.employmentType}
          </span>

        )}

      </div>

      {job.source && (
        <span className="recommendation-source">
          via {job.source}
        </span>
      )}


      {job.skills?.length > 0 && (

        <div className="skills">

          {job.skills
            .slice(0, 5)
            .map((skill) => (

              <span
                className="skill-tag"
                key={skill}
              >
                {skill}
              </span>

            ))}

        </div>

      )}


      {reasons.length > 0 && (

        <section className="recommendation-insight">

          <h4>
            Why it matches
          </h4>

          <ul className="recommendation-reasons">

            {reasons.map(
              (reason, index) => (

                <li key={index}>
                  <span>
                    {reason}
                  </span>
                </li>

              )
            )}

          </ul>

        </section>

      )}


      {missingSkills.length > 0 && (

        <section className="recommendation-insight">

          <h4>
            Skill gaps
          </h4>

          <div className="skills">

            {missingSkills.map(
              (skill) => (

                <span
                  className="skill-tag"
                  key={skill}
                >
                  {skill}
                </span>

              )
            )}

          </div>

        </section>

      )}


      <div className="job-card-bottom">

        <button
          className="view-job-button"
          onClick={() =>
            onViewJob(
              job.job_id
            )
          }
        >
          View Job →
        </button>

      </div>

    </article>
  );
}


export default App;
