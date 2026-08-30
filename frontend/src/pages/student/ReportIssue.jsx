import { useState } from "react";

import {
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
  Network,
  Send,
  Sparkles,
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

const departmentByCategory = {
  Network: "Network Team",
  Electrical: "Electrical Maintenance",
  Civil: "Civil Maintenance",
  Sanitation: "Sanitation Department",
  Hostel: "Hostel Administration",
};

const steps = ["Category", "Details", "Evidence", "AI Review"];

const initialFormData = {
  title: "",
  description: "",
  campusArea: "CSE Block",
  specificArea: "",
};

function getSuggestedPriority(title, description) {
  const complaintText = `${title} ${description}`.toLowerCase();

  const criticalWords = [
    "fire",
    "electric shock",
    "short circuit",
    "collapsed",
    "emergency",
    "dangerous",
    "injury",
  ];

  const highPriorityWords = [
    "not working",
    "leakage",
    "no water",
    "power failure",
    "unsafe",
    "blocked",
    "broken",
  ];

  if (criticalWords.some((word) => complaintText.includes(word))) {
    return "Critical";
  }

  if (highPriorityWords.some((word) => complaintText.includes(word))) {
    return "High";
  }

  return "Medium";
}

function ReportIssue() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("Network");

  const [formData, setFormData] = useState(initialFormData);

  const [evidenceFile, setEvidenceFile] = useState(null);

  const [submittedComplaint, setSubmittedComplaint] = useState(null);

  const [errorMessage, setErrorMessage] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const suggestedPriority = getSuggestedPriority(
    formData.title,
    formData.description,
  );

  const suggestedDepartment = departmentByCategory[selectedCategory];

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));

    if (errorMessage) {
      setErrorMessage("");
    }
  };

  const handleEvidenceChange = (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    const maximumFileSize = 20 * 1024 * 1024;

    if (selectedFile.size > maximumFileSize) {
      setEvidenceFile(null);
      setErrorMessage("Evidence file cannot exceed 20 MB.");
      event.target.value = "";
      return;
    }

    setEvidenceFile(selectedFile);
    setErrorMessage("");
  };

  const goToNextStep = () => {
    setErrorMessage("");

    if (currentStep === 2) {
      if (
        !formData.title.trim() ||
        !formData.description.trim() ||
        !formData.campusArea ||
        !formData.specificArea.trim()
      ) {
        setErrorMessage(
          "Please complete all complaint details before continuing.",
        );
        return;
      }

      if (formData.title.trim().length < 5) {
        setErrorMessage("Complaint title must contain at least 5 characters.");
        return;
      }

      if (formData.description.trim().length < 10) {
        setErrorMessage("Description must contain at least 10 characters.");
        return;
      }
    }

    if (currentStep < steps.length) {
      setCurrentStep((previousStep) => previousStep + 1);
    }
  };

  const goToPreviousStep = () => {
    setErrorMessage("");

    if (currentStep > 1) {
      setCurrentStep((previousStep) => previousStep - 1);
    }
  };

  const handleSubmit = async () => {
    setErrorMessage("");

    try {
      setIsSubmitting(true);

      const response = await api.post("/complaints", {
        title: formData.title.trim(),
        description: formData.description.trim(),

        category: selectedCategory,

        campusArea: formData.campusArea.trim(),

        specificArea: formData.specificArea.trim(),

        /*
            File upload will be connected to
            Cloudinary in a later step.
          */
        evidence: [],
      });

      setSubmittedComplaint(response.data.complaint);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          "Unable to submit your complaint. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setSelectedCategory("Network");
    setFormData(initialFormData);
    setEvidenceFile(null);
    setSubmittedComplaint(null);
    setErrorMessage("");
    setIsSubmitting(false);
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

          <h1 className="mt-3 text-3xl font-extrabold text-gray-900">
            Your complaint has been submitted
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-gray-500">
            ResolveAI categorized the issue and sent it to the{" "}
            {submittedComplaint.department}. You can track every update from My
            Complaints.
          </p>

          <div className="mx-auto mt-7 max-w-sm rounded-2xl bg-gray-50 p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Tracking ID
            </p>

            <p className="mt-2 text-2xl font-extrabold text-gray-900">
              {submittedComplaint.trackingId}
            </p>

            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                {submittedComplaint.category}
              </span>

              <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
                {submittedComplaint.priority} priority
              </span>

              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                {submittedComplaint.status}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={resetForm}
            className="mt-8 rounded-xl bg-emerald-700 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-700/20 hover:bg-emerald-800"
          >
            Report another issue
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-5xl">
      {/* Heading */}
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
          Student services
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
          Report an Issue
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Tell us what happened and ResolveAI will route it to the correct
          department.
        </p>
      </div>

      {/* Step progress */}
      <div className="mt-7 overflow-x-auto rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex min-w-[620px] items-center">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber < currentStep;
            const isCurrent = stepNumber === currentStep;

            return (
              <div
                key={step}
                className="flex flex-1 items-center last:flex-none"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`grid h-9 w-9 place-items-center rounded-full text-sm font-bold transition ${
                      isCompleted
                        ? "bg-emerald-700 text-white"
                        : isCurrent
                          ? "bg-emerald-100 text-emerald-700 ring-4 ring-emerald-50"
                          : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {isCompleted ? <Check size={17} /> : stepNumber}
                  </div>

                  <span
                    className={`text-sm font-bold ${
                      isCurrent || isCompleted
                        ? "text-gray-800"
                        : "text-gray-400"
                    }`}
                  >
                    {step}
                  </span>
                </div>

                {index < steps.length - 1 && (
                  <div
                    className={`mx-4 h-0.5 flex-1 ${
                      stepNumber < currentStep
                        ? "bg-emerald-600"
                        : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Form content */}
      <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
        {errorMessage && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
          >
            {errorMessage}
          </div>
        )}

        {/* Step 1: Category */}
        {currentStep === 1 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              What type of issue are you facing?
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Select the category that best represents your complaint.
            </p>

            <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => {
                const Icon = category.icon;
                const isSelected = selectedCategory === category.name;
                const style = categoryStyles[category.color];

                return (
                  <button
                    key={category.name}
                    type="button"
                    onClick={() => setSelectedCategory(category.name)}
                    className={`relative rounded-2xl border p-5 text-left transition hover:-translate-y-1 hover:shadow-md ${
                      isSelected
                        ? `${style.box} ring-2 ring-emerald-600 ring-offset-2`
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute right-4 top-4 grid h-6 w-6 place-items-center rounded-full bg-emerald-700 text-white">
                        <Check size={14} />
                      </span>
                    )}

                    <div
                      className={`grid h-12 w-12 place-items-center rounded-2xl ${style.icon}`}
                    >
                      <Icon size={24} />
                    </div>

                    <h3 className="mt-5 font-bold text-gray-900">
                      {category.name}
                    </h3>

                    <p className="mt-2 text-xs leading-5 text-gray-500">
                      {category.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Complaint details */}
        {currentStep === 2 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Describe the issue
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Clear information helps the department resolve it faster.
            </p>

            <div className="mt-7 space-y-5">
              <label className="block text-sm font-semibold text-gray-700">
                Complaint title
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Example: Wi-Fi not working in CSE Lab 3"
                  maxLength={120}
                  required
                  className="mt-2 h-12 w-full rounded-xl border border-gray-200 px-4 text-sm outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
                />
              </label>

              <label className="block text-sm font-semibold text-gray-700">
                Detailed description
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={6}
                  maxLength={2000}
                  required
                  placeholder="Explain what happened, when it started and how it is affecting you..."
                  className="mt-2 w-full resize-none rounded-xl border border-gray-200 p-4 text-sm leading-6 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
                />
                <span className="mt-1 block text-right text-xs font-normal text-gray-400">
                  {formData.description.length}/2000
                </span>
              </label>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Campus location
                  <div className="relative mt-2">
                    <MapPin
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <select
                      name="campusArea"
                      value={formData.campusArea}
                      onChange={handleInputChange}
                      required
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
                    required
                    className="mt-2 h-12 w-full rounded-xl border border-gray-200 px-4 text-sm outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
                  />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Evidence */}
        {currentStep === 3 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Add photo or video evidence
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Evidence is optional. Cloud upload will be connected in the next
              backend step.
            </p>

            <label className="mt-7 flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/50 p-8 text-center transition hover:border-emerald-500 hover:bg-emerald-50">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white text-emerald-700 shadow-sm">
                <UploadCloud size={32} />
              </div>

              <p className="mt-5 font-bold text-gray-800">
                Click to select an evidence file
              </p>

              <p className="mt-2 text-xs text-gray-500">
                PNG, JPG, MP4 or PDF up to 20 MB
              </p>

              {evidenceFile && (
                <div className="mt-5 rounded-xl bg-white px-4 py-3 text-left shadow-sm">
                  <p className="max-w-xs truncate text-sm font-bold text-emerald-700">
                    {evidenceFile.name}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    {(evidenceFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              )}

              <input
                type="file"
                accept="image/*,video/*,.pdf"
                onChange={handleEvidenceChange}
                className="hidden"
              />
            </label>

            <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center gap-3">
                <FileImage className="shrink-0 text-emerald-700" size={22} />

                <div>
                  <p className="text-sm font-semibold text-gray-700">
                    Evidence guidelines
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Avoid uploading faces, identity cards or unnecessary
                    personal information.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: AI Review */}
        {currentStep === 4 && (
          <div>
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-100 text-emerald-700">
                <Bot size={25} />
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  AI recommendation
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  Review the suggested classification before submitting.
                </p>
              </div>
            </div>

            <div className="mt-7 grid gap-5 md:grid-cols-2">
              <article className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Complaint summary
                </p>

                <h3 className="mt-4 font-bold text-gray-900">
                  {formData.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-gray-500">
                  {formData.description}
                </p>

                <div className="mt-5 flex items-center gap-2 text-xs text-gray-500">
                  <MapPin size={15} />
                  {formData.campusArea} · {formData.specificArea}
                </div>
              </article>

              <article className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                <div className="flex items-center gap-2 text-emerald-700">
                  <Sparkles size={18} />

                  <p className="text-sm font-bold">ResolveAI suggestion</p>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <ReviewValue
                    label="Category"
                    value={selectedCategory}
                    valueClass="text-emerald-700"
                  />

                  <ReviewValue
                    label="Priority"
                    value={suggestedPriority}
                    valueClass="text-orange-700"
                  />

                  <ReviewValue label="Department" value={suggestedDepartment} />

                  <ReviewValue
                    label="Confidence"
                    value="85%"
                    valueClass="text-emerald-700"
                  />
                </div>
              </article>
            </div>

            <div className="mt-5 rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
              <div className="flex gap-3">
                <Network className="shrink-0 text-yellow-700" size={21} />

                <div>
                  <p className="text-sm font-bold text-yellow-900">
                    Duplicate detection enabled
                  </p>

                  <p className="mt-2 text-xs leading-5 text-yellow-800/70">
                    ResolveAI will compare this report against your unresolved
                    complaints in the same category and location.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-6">
          <button
            type="button"
            onClick={goToPreviousStep}
            disabled={currentStep === 1 || isSubmitting}
            className="flex h-11 items-center gap-2 rounded-xl border border-gray-200 px-4 text-sm font-bold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowLeft size={17} />
            Back
          </button>

          {currentStep < steps.length ? (
            <button
              type="button"
              onClick={goToNextStep}
              className="flex h-11 items-center gap-2 rounded-xl bg-emerald-700 px-5 text-sm font-bold text-white shadow-lg shadow-emerald-700/20 transition hover:bg-emerald-800"
            >
              Continue
              <ArrowRight size={17} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex h-11 items-center gap-2 rounded-xl bg-emerald-700 px-5 text-sm font-bold text-white shadow-lg shadow-emerald-700/20 transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle className="animate-spin" size={17} />
                  Submitting...
                </>
              ) : (
                <>
                  <Send size={17} />
                  Submit complaint
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

function ReviewValue({ label, value, valueClass = "text-gray-800" }) {
  return (
    <div className="rounded-xl bg-white p-4">
      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
        {label}
      </p>

      <p className={`mt-2 text-sm font-bold ${valueClass}`}>{value}</p>
    </div>
  );
}

export default ReportIssue;
