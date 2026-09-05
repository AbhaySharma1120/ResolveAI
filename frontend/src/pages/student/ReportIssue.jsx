import { useState } from "react";

import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bot,
  Building2,
  Check,
  CheckCircle2,
  Droplets,
  FileImage,
  House,
  LoaderCircle,
  MapPin,
  RefreshCw,
  Send,
  Sparkles,
  Trash2,
  UploadCloud,
  Wifi,
  Zap,
} from "lucide-react";

import api from "../../services/api";

const categories = [
  {
    name: "Network",
    description: "Wi-Fi, LAN and internet connectivity",
    icon: Wifi,
    color: "emerald",
  },
  {
    name: "Electrical",
    description: "Lights, fans, switches and power supply",
    icon: Zap,
    color: "yellow",
  },
  {
    name: "Civil",
    description: "Walls, doors, furniture and infrastructure",
    icon: Building2,
    color: "blue",
  },
  {
    name: "Sanitation",
    description: "Cleaning, waste disposal and washrooms",
    icon: Droplets,
    color: "cyan",
  },
  {
    name: "Hostel",
    description: "Hostel rooms, water and common facilities",
    icon: House,
    color: "orange",
  },
];

const categoryStyles = {
  emerald: {
    box: "border-emerald-200 bg-emerald-50",
    icon: "bg-emerald-100 text-emerald-700",
  },
  yellow: {
    box: "border-yellow-200 bg-yellow-50",
    icon: "bg-yellow-100 text-yellow-700",
  },
  blue: {
    box: "border-blue-200 bg-blue-50",
    icon: "bg-blue-100 text-blue-700",
  },
  cyan: {
    box: "border-cyan-200 bg-cyan-50",
    icon: "bg-cyan-100 text-cyan-700",
  },
  orange: {
    box: "border-orange-200 bg-orange-50",
    icon: "bg-orange-100 text-orange-700",
  },
};

const steps = ["Category", "Details", "Evidence", "AI Review"];

const initialFormData = {
  title: "",
  description: "",
  campusArea: "CSE Block",
  specificArea: "",
};

const allowedFileTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/webm",
  "application/pdf",
];

function ReportIssue() {
  const [currentStep, setCurrentStep] = useState(1);

  const [selectedCategory, setSelectedCategory] = useState("Network");

  const [formData, setFormData] = useState(initialFormData);

  const [evidenceFile, setEvidenceFile] = useState(null);

  const [evidencePreview, setEvidencePreview] = useState("");

  const [submittedComplaint, setSubmittedComplaint] = useState(null);

  const [errorMessage, setErrorMessage] = useState("");

  const [reviewError, setReviewError] = useState("");

  const [aiReview, setAiReview] = useState(null);

  const [isReviewing, setIsReviewing] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [uploadProgress, setUploadProgress] = useState(0);

  const [submissionStage, setSubmissionStage] = useState("");

  const clearAIReview = () => {
    setAiReview(null);
    setReviewError("");
  };

  const handleCategorySelection = (categoryName) => {
    setSelectedCategory(categoryName);
    clearAIReview();
    setErrorMessage("");
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));

    clearAIReview();
    setErrorMessage("");
  };

  const clearEvidence = () => {
    if (evidencePreview) {
      URL.revokeObjectURL(evidencePreview);
    }

    setEvidenceFile(null);
    setEvidencePreview("");
    setUploadProgress(0);
  };

  const handleEvidenceChange = (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    const maximumFileSize = 20 * 1024 * 1024;

    if (!allowedFileTypes.includes(selectedFile.type)) {
      clearEvidence();

      setErrorMessage(
        "Only JPG, PNG, WEBP, MP4, WEBM and PDF files are allowed.",
      );

      event.target.value = "";
      return;
    }

    if (selectedFile.size > maximumFileSize) {
      clearEvidence();

      setErrorMessage("Evidence file cannot exceed 20 MB.");

      event.target.value = "";
      return;
    }

    if (evidencePreview) {
      URL.revokeObjectURL(evidencePreview);
    }

    setEvidenceFile(selectedFile);

    if (
      selectedFile.type.startsWith("image/") ||
      selectedFile.type.startsWith("video/")
    ) {
      setEvidencePreview(URL.createObjectURL(selectedFile));
    } else {
      setEvidencePreview("");
    }

    setUploadProgress(0);
    setErrorMessage("");
  };

  const validateDetails = () => {
    if (
      !formData.title.trim() ||
      !formData.description.trim() ||
      !formData.campusArea ||
      !formData.specificArea.trim()
    ) {
      setErrorMessage(
        "Please complete all complaint details before continuing.",
      );

      return false;
    }

    if (formData.title.trim().length < 5) {
      setErrorMessage("Complaint title must contain at least 5 characters.");

      return false;
    }

    if (formData.description.trim().length < 10) {
      setErrorMessage("Description must contain at least 10 characters.");

      return false;
    }

    return true;
  };

  const generateAIReview = async () => {
    if (!validateDetails()) {
      setCurrentStep(2);
      return;
    }

    try {
      setIsReviewing(true);
      setReviewError("");
      setErrorMessage("");
      setAiReview(null);
      setCurrentStep(4);

      const response = await api.post("/ai/complaint-review", {
        title: formData.title.trim(),

        description: formData.description.trim(),

        category: selectedCategory,

        campusArea: formData.campusArea.trim(),

        specificArea: formData.specificArea.trim(),
      });

      setAiReview(response.data.analysis);
    } catch (error) {
      console.error("AI review error:", error);

      setReviewError(
        error.response?.data?.message ||
          "Unable to generate the AI review. Please try again.",
      );
    } finally {
      setIsReviewing(false);
    }
  };

  const goToNextStep = async () => {
    setErrorMessage("");

    if (currentStep === 2 && !validateDetails()) {
      return;
    }

    if (currentStep === 3) {
      await generateAIReview();
      return;
    }

    if (currentStep < steps.length) {
      setCurrentStep((previousStep) => previousStep + 1);
    }
  };

  const goToPreviousStep = () => {
    setErrorMessage("");
    setReviewError("");

    if (currentStep > 1) {
      setCurrentStep((previousStep) => previousStep - 1);
    }
  };

  const uploadEvidence = async () => {
    if (!evidenceFile) {
      return [];
    }

    const uploadData = new FormData();

    uploadData.append("evidence", evidenceFile);

    setSubmissionStage("Uploading evidence...");

    setUploadProgress(0);

    const response = await api.post("/uploads/evidence", uploadData, {
      onUploadProgress: (progressEvent) => {
        if (!progressEvent.total) {
          return;
        }

        const progress = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total,
        );

        setUploadProgress(progress);
      },
    });

    setUploadProgress(100);

    return [response.data.evidence];
  };

  const handleSubmit = async () => {
    setErrorMessage("");

    if (!validateDetails()) {
      setCurrentStep(2);
      return;
    }

    if (!aiReview) {
      setReviewError("Generate the AI review before submitting.");

      return;
    }

    try {
      setIsSubmitting(true);

      const uploadedEvidence = await uploadEvidence();

      setSubmissionStage("Submitting complaint...");

      const response = await api.post("/complaints", {
        title: formData.title.trim(),

        description: formData.description.trim(),

        /*
            Use Gemini's reviewed category.
            The backend will validate it again.
          */
        category: aiReview.suggestedCategory || selectedCategory,

        campusArea: formData.campusArea.trim(),

        specificArea: formData.specificArea.trim(),

        evidence: uploadedEvidence,
      });

      setSubmittedComplaint(response.data.complaint);

      setSubmissionStage("");
    } catch (error) {
      console.error("Complaint submission error:", error);

      setErrorMessage(
        error.response?.data?.message ||
          "Unable to submit your complaint. Please try again.",
      );

      setSubmissionStage("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    clearEvidence();

    setCurrentStep(1);
    setSelectedCategory("Network");
    setFormData(initialFormData);
    setSubmittedComplaint(null);
    setErrorMessage("");
    setReviewError("");
    setAiReview(null);
    setIsReviewing(false);
    setIsSubmitting(false);
    setSubmissionStage("");
  };

  if (submittedComplaint) {
    return (
      <section className="mx-auto grid min-h-[calc(100vh-145px)] max-w-3xl place-items-center">
        <div className="w-full rounded-3xl border border-emerald-100 bg-white p-8 text-center shadow-sm sm:p-12">
          <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-emerald-100 text-emerald-700">
            <CheckCircle2 size={48} />
          </div>

          <p className="mt-7 text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">
            Complaint registered
          </p>

          <h1 className="mt-3 text-2xl font-bold text-gray-900 sm:text-3xl">
            Your complaint has been submitted
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-gray-500">
            Your complaint has been forwarded to{" "}
            <span className="font-semibold text-gray-700">
              {submittedComplaint.department}
            </span>
            . You can track every update from My Complaints.
          </p>

          <div className="mx-auto mt-8 max-w-md rounded-2xl border border-gray-200 bg-gray-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              Tracking ID
            </p>

            <p className="mt-2 text-2xl font-bold text-emerald-700">
              {submittedComplaint.trackingId}
            </p>

            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
                {submittedComplaint.category}
              </span>

              <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
                {submittedComplaint.priority} priority
              </span>

              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                {submittedComplaint.status}
              </span>
            </div>

            {submittedComplaint.evidence?.length > 0 && (
              <div className="mt-4 flex items-center justify-center gap-2 text-xs font-semibold text-violet-700">
                <FileImage size={15} />
                Evidence uploaded successfully
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={resetForm}
            className="mt-8 rounded-xl bg-emerald-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
          >
            Report another issue
          </button>
        </div>
      </section>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      {/* Heading */}
      <section>
        <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
          <Sparkles size={17} />
          AI-assisted complaint submission
        </div>

        <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
          Report an Issue
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Provide clear information so the responsible department can resolve
          your complaint quickly.
        </p>
      </section>

      {/* Progress steps */}
      <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="grid grid-cols-4 gap-2">
          {steps.map((step, index) => {
            const stepNumber = index + 1;

            const completed = currentStep > stepNumber;

            const active = currentStep === stepNumber;

            return (
              <div key={step} className="text-center">
                <div className="flex items-center">
                  {index > 0 && (
                    <span
                      className={`h-0.5 flex-1 ${
                        currentStep >= stepNumber
                          ? "bg-emerald-600"
                          : "bg-gray-200"
                      }`}
                    />
                  )}

                  <span
                    className={`mx-auto grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-bold ${
                      completed
                        ? "bg-emerald-600 text-white"
                        : active
                          ? "bg-emerald-700 text-white ring-4 ring-emerald-100"
                          : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {completed ? <Check size={17} /> : stepNumber}
                  </span>

                  {index < steps.length - 1 && (
                    <span
                      className={`h-0.5 flex-1 ${
                        currentStep > stepNumber
                          ? "bg-emerald-600"
                          : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>

                <p
                  className={`mt-3 hidden text-xs font-semibold sm:block ${
                    active || completed ? "text-emerald-700" : "text-gray-400"
                  }`}
                >
                  {step}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {errorMessage && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
          {errorMessage}
        </div>
      )}

      <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8">
        {/* Step 1 */}
        {currentStep === 1 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Select complaint category
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Choose the category that best describes your issue.
            </p>

            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              {categories.map((category) => {
                const Icon = category.icon;

                const selected = selectedCategory === category.name;

                const styles = categoryStyles[category.color];

                return (
                  <button
                    key={category.name}
                    type="button"
                    onClick={() => handleCategorySelection(category.name)}
                    className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition ${
                      selected
                        ? `${styles.box} ring-2 ring-emerald-500`
                        : "border-gray-200 hover:border-emerald-200 hover:bg-gray-50"
                    }`}
                  >
                    <span
                      className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${styles.icon}`}
                    >
                      <Icon size={23} />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block font-bold text-gray-900">
                        {category.name}
                      </span>

                      <span className="mt-1 block text-xs leading-5 text-gray-500">
                        {category.description}
                      </span>
                    </span>

                    {selected && (
                      <span className="grid h-7 w-7 place-items-center rounded-full bg-emerald-600 text-white">
                        <Check size={15} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2 */}
        {currentStep === 2 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Describe the issue
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Add clear details and the exact campus location.
            </p>

            <div className="mt-7 space-y-5">
              <label className="block text-sm font-semibold text-gray-700">
                Complaint title
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Example: Fan is not working"
                  maxLength={120}
                  className="mt-2 h-12 w-full rounded-xl border border-gray-200 px-4 text-sm outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
                />
              </label>

              <label className="block text-sm font-semibold text-gray-700">
                Description
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Explain what happened and when the issue started..."
                  maxLength={2000}
                  rows={6}
                  className="mt-2 w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
                />
              </label>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Campus area
                  <div className="relative mt-2">
                    <MapPin
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <select
                      name="campusArea"
                      value={formData.campusArea}
                      onChange={handleInputChange}
                      className="h-12 w-full appearance-none rounded-xl border border-gray-200 bg-white pl-11 pr-4 text-sm outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
                    >
                      <option value="CSE Block">CSE Block</option>

                      <option value="Academic Block">Academic Block</option>

                      <option value="Central Library">Central Library</option>

                      <option value="Boys Hostel">Boys Hostel</option>

                      <option value="Girls Hostel">Girls Hostel</option>

                      <option value="Sports Complex">Sports Complex</option>
                    </select>
                  </div>
                </label>

                <label className="block text-sm font-semibold text-gray-700">
                  Specific area
                  <input
                    type="text"
                    name="specificArea"
                    value={formData.specificArea}
                    onChange={handleInputChange}
                    placeholder="Example: Lab 3, second floor"
                    maxLength={150}
                    className="mt-2 h-12 w-full rounded-xl border border-gray-200 px-4 text-sm outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
                  />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {currentStep === 3 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900">Add evidence</h2>

            <p className="mt-2 text-sm text-gray-500">
              Evidence is optional. Upload one image, video or PDF up to 20 MB.
            </p>

            {!evidenceFile ? (
              <label className="mt-7 flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/50 p-8 text-center transition hover:border-emerald-500 hover:bg-emerald-50">
                <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white text-emerald-700 shadow-sm">
                  <UploadCloud size={32} />
                </div>

                <p className="mt-5 font-bold text-gray-800">
                  Click to select an evidence file
                </p>

                <p className="mt-2 text-xs text-gray-500">
                  JPG, PNG, WEBP, MP4, WEBM or PDF up to 20 MB
                </p>

                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,.mp4,.webm,.pdf,image/*,video/mp4,video/webm,application/pdf"
                  onChange={handleEvidenceChange}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="mt-7 overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
                {evidenceFile.type.startsWith("image/") && evidencePreview && (
                  <img
                    src={evidencePreview}
                    alt="Evidence preview"
                    className="h-64 w-full bg-slate-900 object-contain"
                  />
                )}

                {evidenceFile.type.startsWith("video/") && evidencePreview && (
                  <video
                    src={evidencePreview}
                    controls
                    className="h-64 w-full bg-slate-900 object-contain"
                  >
                    <track kind="captions" />
                  </video>
                )}

                {evidenceFile.type === "application/pdf" && (
                  <div className="grid h-52 place-items-center bg-red-50 text-red-600">
                    <FileImage size={54} />
                  </div>
                )}

                <div className="flex items-center gap-4 p-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
                    <FileImage size={21} />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-gray-800">
                      {evidenceFile.name}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      {(evidenceFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={clearEvidence}
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-red-500 transition hover:bg-red-50"
                    aria-label="Remove evidence"
                    title="Remove evidence"
                  >
                    <Trash2 size={19} />
                  </button>
                </div>
              </div>
            )}

            <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center gap-3">
                <FileImage className="shrink-0 text-emerald-700" size={22} />

                <div>
                  <p className="text-sm font-semibold text-gray-700">
                    Evidence guidelines
                  </p>

                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    Avoid uploading faces, identity cards or unnecessary
                    personal information.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4 */}
        {currentStep === 4 && (
          <div>
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-100 text-emerald-700">
                <Bot size={25} />
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Gemini AI Review
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  Review the real AI-generated classification before submitting.
                </p>
              </div>
            </div>

            {isReviewing && (
              <div className="mt-8 grid min-h-72 place-items-center rounded-2xl border border-emerald-100 bg-emerald-50">
                <div className="text-center">
                  <LoaderCircle
                    size={38}
                    className="mx-auto animate-spin text-emerald-700"
                  />

                  <p className="mt-4 font-bold text-emerald-900">
                    Gemini is analyzing your complaint
                  </p>

                  <p className="mt-2 text-sm text-emerald-700">
                    Checking category, urgency and possible duplicates...
                  </p>
                </div>
              </div>
            )}

            {!isReviewing && reviewError && (
              <div className="mt-7 rounded-2xl border border-red-200 bg-red-50 p-5">
                <div className="flex items-start gap-3">
                  <AlertTriangle
                    size={21}
                    className="mt-0.5 shrink-0 text-red-600"
                  />

                  <div className="flex-1">
                    <p className="font-bold text-red-800">AI review failed</p>

                    <p className="mt-1 text-sm text-red-700">{reviewError}</p>

                    <button
                      type="button"
                      onClick={generateAIReview}
                      className="mt-4 flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                    >
                      <RefreshCw size={16} />
                      Try again
                    </button>
                  </div>
                </div>
              </div>
            )}

            {!isReviewing && aiReview && (
              <>
                <div className="mt-7 rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                        AI confidence
                      </p>

                      <p className="mt-1 text-3xl font-bold text-emerald-900">
                        {aiReview.confidence}%
                      </p>
                    </div>

                    <div className="h-3 flex-1 overflow-hidden rounded-full bg-emerald-100 sm:max-w-sm">
                      <div
                        className="h-full rounded-full bg-emerald-600 transition-all duration-500"
                        style={{
                          width: `${aiReview.confidence}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-cyan-100 bg-cyan-50 p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-cyan-700">
                    AI summary
                  </p>

                  <p className="mt-2 text-sm leading-7 text-cyan-900">
                    {aiReview.summary}
                  </p>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <ReviewCard label="Complaint title" value={formData.title} />

                  <ReviewCard
                    label="Selected category"
                    value={selectedCategory}
                  />

                  <ReviewCard
                    label="AI category"
                    value={aiReview.suggestedCategory}
                    highlighted
                  />

                  <ReviewCard
                    label="AI priority"
                    value={aiReview.suggestedPriority}
                    highlighted
                  />

                  <ReviewCard
                    label="Assigned department"
                    value={aiReview.suggestedDepartment}
                  />

                  <ReviewCard
                    label="Location"
                    value={`${formData.campusArea} · ${formData.specificArea}`}
                  />

                  <ReviewCard
                    label="Evidence"
                    value={
                      evidenceFile ? evidenceFile.name : "No evidence attached"
                    }
                  />
                </div>

                {aiReview.possibleDuplicate && aiReview.duplicateComplaint && (
                  <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5">
                    <div className="flex items-start gap-3">
                      <AlertTriangle
                        size={22}
                        className="mt-0.5 shrink-0 text-amber-600"
                      />

                      <div>
                        <p className="font-bold text-amber-900">
                          Possible duplicate detected
                        </p>

                        <p className="mt-2 text-sm leading-6 text-amber-800">
                          This complaint may be related to{" "}
                          <strong>
                            {aiReview.duplicateComplaint.trackingId}
                          </strong>
                          : {aiReview.duplicateComplaint.title}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {!aiReview.possibleDuplicate && (
                  <div className="mt-5 flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
                    <CheckCircle2 size={20} />
                    No clear duplicate complaint was detected.
                  </div>
                )}
              </>
            )}

            {isSubmitting &&
              evidenceFile &&
              submissionStage === "Uploading evidence..." && (
                <div className="mt-5 rounded-2xl border border-violet-100 bg-violet-50 p-5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-violet-800">
                      Uploading evidence
                    </span>

                    <span className="font-bold text-violet-700">
                      {uploadProgress}%
                    </span>
                  </div>

                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-violet-100">
                    <div
                      className="h-full rounded-full bg-violet-600 transition-all duration-300"
                      style={{
                        width: `${uploadProgress}%`,
                      }}
                    />
                  </div>
                </div>
              )}
          </div>
        )}

        {/* Navigation buttons */}
        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={goToPreviousStep}
            disabled={currentStep === 1 || isSubmitting || isReviewing}
            className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowLeft size={18} />
            Previous
          </button>

          {currentStep < steps.length ? (
            <button
              type="button"
              onClick={goToNextStep}
              disabled={isReviewing}
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Continue
              <ArrowRight size={18} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || isReviewing || !aiReview}
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle size={18} className="animate-spin" />

                  {submissionStage || "Submitting..."}
                </>
              ) : (
                <>
                  <Send size={18} />
                  Submit complaint
                </>
              )}
            </button>
          )}
        </div>
      </section>
    </div>
  );
}

function ReviewCard({ label, value, highlighted = false }) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        highlighted
          ? "border-emerald-200 bg-emerald-50"
          : "border-gray-200 bg-gray-50"
      }`}
    >
      <p
        className={`text-xs font-semibold uppercase tracking-wide ${
          highlighted ? "text-emerald-600" : "text-gray-400"
        }`}
      >
        {label}
      </p>

      <p
        className={`mt-2 break-words text-sm font-bold ${
          highlighted ? "text-emerald-800" : "text-gray-800"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

export default ReportIssue;
