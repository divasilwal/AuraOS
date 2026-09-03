import { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabase";

const LEAD_STATUSES = [
  "Prospect",
  "Contacted",
  "Meeting",
  "Proposal",
  "Won",
  "Lost",
];

const INDUSTRIES = [
  "Real Estate",
  "Hospitality",
  "Restaurant",
  "Automotive",
  "Education",
  "Healthcare",
  "Fashion",
  "Other",
];

const PROJECT_TYPES = [
  "Commercial Video",
  "Social Media",
  "Advertisement",
  "Corporate Film",
  "Music Video",
  "Photography",
  "Event Coverage",
  "Product Shoot",
  "Documentary",
  "Other",
];

const PROJECT_STATUSES = [
  "Planning",
  "Pre-Production",
  "Production",
  "Post-Production",
  "Review",
  "Completed",
  "Cancelled",
];

const PAYMENT_STATUSES = [
  "Pending",
  "Partial",
  "Paid",
  "Overdue",
];

const TASK_STAGES = [
  "Pre-production",
  "Production",
  "Post-production",
  "Delivery",
];

const TASK_STATUSES = [
  "To Do",
  "In Progress",
  "Blocked",
  "Done",
];

const emptyLeadForm = {
  company: "",
  contact: "",
  phone: "",
  industry: "Real Estate",
  value: "45000",
  status: "Prospect",
  followUp: "",
  notes: "",
  lostReason: "",
};

const emptyClientForm = {
  company: "",
  contact: "",
  phone: "",
  industry: "Real Estate",
  monthlyValue: "45000",
  contractStart: "",
  contractEnd: "",
  paymentStatus: "Pending",
  status: "Active",
  notes: "",
};

const emptyProjectForm = {
  clientId: "",
  name: "",
  projectType: "Commercial Video",
  status: "Planning",
  description: "",
  startDate: "",
  deadline: "",
  budget: "0",
  paymentStatus: "Pending",
  notes: "",
};

const emptyTaskForm = {
  projectId: "",
  title: "",
  stage: "Pre-production",
  status: "To Do",
  assignedTo: "",
  dueDate: "",
  notes: "",
};

const emptyPaymentForm = {
  projectId: "",
  amount: "",
  paymentDate: "",
  status: "Pending",
  notes: "",
};

function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  const [activePage, setActivePage] = useState("Dashboard");

  const [leads, setLeads] = useState([]);
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [projectTasks, setProjectTasks] = useState([]);
  const [projectPayments, setProjectPayments] = useState([]);

  const [leadView, setLeadView] = useState("active");
  const [calendarFilter, setCalendarFilter] = useState("all");

  const [showLeadModal, setShowLeadModal] = useState(false);
  const [showClientModal, setShowClientModal] =
    useState(false);
  const [showProjectModal, setShowProjectModal] =
    useState(false);
  const [showTaskModal, setShowTaskModal] =
    useState(false);
  const [showPaymentModal, setShowPaymentModal] =
    useState(false);

  const [editingLead, setEditingLead] = useState(null);
  const [editingProject, setEditingProject] =
    useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [editingPayment, setEditingPayment] = useState(null);

  const [selectedProject, setSelectedProject] =
    useState(null);

  const [leadForm, setLeadForm] =
    useState(emptyLeadForm);
  const [clientForm, setClientForm] =
    useState(emptyClientForm);
  const [projectForm, setProjectForm] =
    useState(emptyProjectForm);
  const [taskForm, setTaskForm] = useState(emptyTaskForm);
  const [paymentForm, setPaymentForm] =
    useState(emptyPaymentForm);

  const [loadingLeads, setLoadingLeads] =
    useState(false);
  const [loadingClients, setLoadingClients] =
    useState(false);
  const [loadingProjects, setLoadingProjects] =
    useState(false);
  const [loadingTasks, setLoadingTasks] =
    useState(false);
  const [loadingPayments, setLoadingPayments] =
    useState(false);

  const [saving, setSaving] = useState(false);
  const [savingTask, setSavingTask] = useState(false);
  const [savingPayment, setSavingPayment] =
    useState(false);
  const [error, setError] = useState("");

  const [deletingLeadId, setDeletingLeadId] =
    useState(null);
  const [deletingProjectId, setDeletingProjectId] =
    useState(null);
  const [deletingTaskId, setDeletingTaskId] =
    useState(null);
  const [deletingPaymentId, setDeletingPaymentId] =
    useState(null);

  useEffect(() => {
    let mounted = true;

    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (mounted) {
        setSession(session);
        setAuthLoading(false);
      }
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        setSession(currentSession);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session) {
      setLeads([]);
      setClients([]);
      setProjects([]);
      setProjectTasks([]);
      setProjectPayments([]);
      return;
    }

    loadLeads();
    loadClients();
    loadProjects();
    loadProjectTasks();
    loadProjectPayments();
  }, [session]);

  const loadLeads = async () => {
    setLoadingLeads(true);

    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error("LOAD LEADS:", error);
      setError("Could not load leads.");
    } else {
      setLeads(data || []);
    }

    setLoadingLeads(false);
  };

  const loadClients = async () => {
    setLoadingClients(true);

    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error("LOAD CLIENTS:", error);
      setError("Could not load clients.");
    } else {
      setClients(data || []);
    }

    setLoadingClients(false);
  };

  const loadProjects = async () => {
    setLoadingProjects(true);

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error("LOAD PROJECTS:", error);
      setError("Could not load projects.");
    } else {
      setProjects(data || []);
    }

    setLoadingProjects(false);
  };

  const loadProjectTasks = async () => {
    setLoadingTasks(true);

    const { data, error } = await supabase
      .from("project_tasks")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error("LOAD PROJECT TASKS:", error);
      setError("Could not load production tasks.");
    } else {
      setProjectTasks(data || []);
    }

    setLoadingTasks(false);
  };

  const loadProjectPayments = async () => {
    setLoadingPayments(true);

    const { data, error } = await supabase
      .from("project_payments")
      .select("*")
      .order("payment_date", {
        ascending: false,
      });

    if (error) {
      console.error("LOAD PROJECT PAYMENTS:", error);
      setError("Could not load project payments.");
    } else {
      setProjectPayments(data || []);
    }

    setLoadingPayments(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoginError("");

    const cleanEmail = email.trim();

    if (!cleanEmail || !password) {
      setLoginError(
        "Enter your email and password."
      );
      return;
    }

    setLoggingIn(true);

    const { data, error } =
      await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

    if (error) {
      console.error("LOGIN:", error);
      setLoginError(
        "Login failed. Check your email and password."
      );
      setLoggingIn(false);
      return;
    }

    setSession(data.session);
    setPassword("");
    setLoggingIn(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();

    setSession(null);
    setActivePage("Dashboard");
    setLeads([]);
    setClients([]);
    setProjects([]);
    setProjectTasks([]);
    setProjectPayments([]);
  };

  const resetLeadForm = () => {
    setLeadForm({
      ...emptyLeadForm,
    });
    setEditingLead(null);
  };

  const resetClientForm = () => {
    setClientForm({
      ...emptyClientForm,
    });
  };

  const resetProjectForm = () => {
    setProjectForm({
      ...emptyProjectForm,
    });
    setEditingProject(null);
  };

  const resetTaskForm = () => {
    setTaskForm({
      ...emptyTaskForm,
    });
    setEditingTask(null);
  };

  const openNewLeadModal = () => {
    setError("");
    resetLeadForm();
    setShowLeadModal(true);
  };

  const openEditLeadModal = (lead) => {
    setError("");
    setEditingLead(lead);

    setLeadForm({
      company: lead.company || "",
      contact: lead.contact || "",
      phone: lead.phone || "",
      industry:
        lead.industry || "Other",
      value:
        lead.value === null ||
        lead.value === undefined
          ? ""
          : String(lead.value),
      status:
        lead.status || "Prospect",
      followUp: lead.follow_up || "",
      notes: lead.notes || "",
      lostReason:
        lead.lost_reason || "",
    });

    setShowLeadModal(true);
  };

  const closeLeadModal = () => {
    if (saving) return;

    setShowLeadModal(false);
    resetLeadForm();
  };

  const openNewClientModal = () => {
    setError("");
    resetClientForm();
    setShowClientModal(true);
  };

  const closeClientModal = () => {
    if (saving) return;

    setShowClientModal(false);
    resetClientForm();
  };

  const openNewProjectModal = () => {
    setError("");

    resetProjectForm();

    if (clients.length > 0) {
      setProjectForm({
        ...emptyProjectForm,
        clientId: String(clients[0].id),
      });
    }

    setShowProjectModal(true);
  };

  const openEditProjectModal = (project) => {
    setError("");
    setEditingProject(project);

    setProjectForm({
      clientId: String(
        project.client_id || ""
      ),
      name: project.name || "",
      projectType:
        project.project_type || "Other",
      status:
        project.status || "Planning",
      description:
        project.description || "",
      startDate:
        project.start_date || "",
      deadline:
        project.deadline || "",
      budget:
        project.budget === null ||
        project.budget === undefined
          ? "0"
          : String(project.budget),
      paymentStatus:
        project.payment_status ||
        "Pending",
      notes: project.notes || "",
    });

    setShowProjectModal(true);
  };

  const closeProjectModal = () => {
    if (saving) return;

    setShowProjectModal(false);
    resetProjectForm();
  };

  const openNewTaskModal = (project = selectedProject) => {
    setError("");
    resetTaskForm();
    setTaskForm({
      ...emptyTaskForm,
      projectId: project ? String(project.id) : "",
    });
    setShowTaskModal(true);
  };

  const openEditTaskModal = (task) => {
    setError("");
    setEditingTask(task);
    setTaskForm({
      projectId: String(task.project_id || ""),
      title: task.title || "",
      stage: task.stage || "Pre-production",
      status: task.status || "To Do",
      assignedTo: task.assigned_to || "",
      dueDate: task.due_date || "",
      notes: task.notes || "",
    });
    setShowTaskModal(true);
  };

  const closeTaskModal = () => {
    if (savingTask) return;

    setShowTaskModal(false);
    resetTaskForm();
  };

  const resetPaymentForm = () => {
    setPaymentForm({
      ...emptyPaymentForm,
    });
    setEditingPayment(null);
  };

  const openNewPaymentModal = (
    project = selectedProject
  ) => {
    setError("");
    resetPaymentForm();
    setPaymentForm({
      ...emptyPaymentForm,
      projectId: project ? String(project.id) : "",
      paymentDate: new Date()
        .toISOString()
        .slice(0, 10),
    });
    setShowPaymentModal(true);
  };

  const openEditPaymentModal = (payment) => {
    setError("");
    setEditingPayment(payment);
    setPaymentForm({
      projectId: String(payment.project_id || ""),
      amount: String(payment.amount || ""),
      paymentDate: payment.payment_date || "",
      status: payment.status || "Pending",
      notes: payment.notes || "",
    });
    setShowPaymentModal(true);
  };

  const closePaymentModal = () => {
    if (savingPayment) return;

    setShowPaymentModal(false);
    resetPaymentForm();
  };

  const updateLeadStatus = (status) => {
    setLeadForm((current) => ({
      ...current,
      status,
      followUp:
        status === "Won" ||
        status === "Lost"
          ? ""
          : current.followUp,
      lostReason:
        status === "Lost"
          ? current.lostReason
          : "",
    }));
  };

  const validateLead = () => {
    const company =
      leadForm.company.trim();
    const phone =
      leadForm.phone.trim();
    const notes =
      leadForm.notes.trim();
    const lostReason =
      leadForm.lostReason.trim();

    if (!company) {
      return "Company name is required.";
    }

    if (
      phone &&
      !/^\d{10}$/.test(phone)
    ) {
      return "Phone number must contain exactly 10 digits.";
    }

    if (
      leadForm.value === "" ||
      !/^\d+$/.test(
        String(leadForm.value)
      )
    ) {
      return "Potential value must be a whole number.";
    }

    const value = Number(
      leadForm.value
    );

    if (
      !Number.isSafeInteger(value) ||
      value < 0
    ) {
      return "Potential value must be 0 or more.";
    }

    if (
      !["Won", "Lost"].includes(
        leadForm.status
      ) &&
      !leadForm.followUp
    ) {
      return "Set a follow-up date for this lead.";
    }

    if (
      leadForm.status === "Lost" &&
      !lostReason
    ) {
      return "Add a reason for losing this lead.";
    }

    if (
      leadForm.status === "Lost" &&
      !notes
    ) {
      return "Add a short note explaining what happened.";
    }

    return null;
  };

  const saveLead = async (e) => {
    e.preventDefault();

    if (saving) return;

    setError("");

    const validationError =
      validateLead();

    if (validationError) {
      setError(validationError);
      return;
    }

    const payload = {
      company:
        leadForm.company.trim(),

      contact:
        leadForm.contact.trim() ||
        null,

      phone:
        leadForm.phone.trim() ||
        null,

      industry:
        leadForm.industry,

      value: Number(
        leadForm.value
      ),

      status:
        leadForm.status,

      follow_up:
        ["Won", "Lost"].includes(
          leadForm.status
        )
          ? null
          : leadForm.followUp,

      notes:
        leadForm.notes.trim() ||
        null,

      lost_reason:
        leadForm.status === "Lost"
          ? leadForm.lostReason.trim()
          : null,
    };

    setSaving(true);

    let result;

    if (editingLead) {
      result = await supabase
        .from("leads")
        .update(payload)
        .eq("id", editingLead.id)
        .select()
        .single();
    } else {
      result = await supabase
        .from("leads")
        .insert(payload)
        .select()
        .single();
    }

    const { data, error } =
      result;

    if (error) {
      console.error(
        "SAVE LEAD:",
        error
      );

      setError(
        error.message ||
          "Could not save the lead."
      );

      setSaving(false);
      return;
    }

    if (editingLead) {
      setLeads((current) =>
        current.map((lead) =>
          lead.id === data.id
            ? data
            : lead
        )
      );
    } else {
      setLeads((current) => [
        data,
        ...current,
      ]);
    }

    setSaving(false);
    closeLeadModal();
  };

  const validateClient = () => {
    const company =
      clientForm.company.trim();

    const phone =
      clientForm.phone.trim();

    if (!company) {
      return "Company name is required.";
    }

    if (
      phone &&
      !/^\d{10}$/.test(phone)
    ) {
      return "Phone number must contain exactly 10 digits.";
    }

    if (
      clientForm.monthlyValue ===
        "" ||
      !/^\d+$/.test(
        String(
          clientForm.monthlyValue
        )
      )
    ) {
      return "Monthly value must be a whole number.";
    }

    const monthlyValue =
      Number(
        clientForm.monthlyValue
      );

    if (
      !Number.isSafeInteger(
        monthlyValue
      ) ||
      monthlyValue < 0
    ) {
      return "Monthly value must be 0 or more.";
    }

    if (
      clientForm.contractStart &&
      clientForm.contractEnd &&
      clientForm.contractEnd <
        clientForm.contractStart
    ) {
      return "Contract end cannot be before contract start.";
    }

    return null;
  };

  const saveClient = async (e) => {
    e.preventDefault();

    if (saving) return;

    setError("");

    const validationError =
      validateClient();

    if (validationError) {
      setError(validationError);
      return;
    }

    const payload = {
      company:
        clientForm.company.trim(),

      contact:
        clientForm.contact.trim() ||
        null,

      phone:
        clientForm.phone.trim() ||
        null,

      industry:
        clientForm.industry,

      monthly_value:
        Number(
          clientForm.monthlyValue
        ),

      contract_start:
        clientForm.contractStart ||
        null,

      contract_end:
        clientForm.contractEnd ||
        null,

      payment_status:
        clientForm.paymentStatus,

      status:
        clientForm.status,

      notes:
        clientForm.notes.trim() ||
        null,
    };

    setSaving(true);

    const { data, error } =
      await supabase
        .from("clients")
        .insert(payload)
        .select()
        .single();

    if (error) {
      console.error(
        "SAVE CLIENT:",
        error
      );

      setError(
        error.message ||
          "Could not save the client."
      );

      setSaving(false);
      return;
    }

    setClients((current) => [
      data,
      ...current,
    ]);

    setSaving(false);
    closeClientModal();
  };

  const validateProject = () => {
    const name =
      projectForm.name.trim();

    if (!name) {
      return "Project name is required.";
    }

    if (!projectForm.clientId) {
      return "Select a client for this project.";
    }

    if (
      projectForm.budget === "" ||
      !/^\d+$/.test(
        String(
          projectForm.budget
        )
      )
    ) {
      return "Budget must be a whole number.";
    }

    const budget = Number(
      projectForm.budget
    );

    if (
      !Number.isSafeInteger(
        budget
      ) ||
      budget < 0
    ) {
      return "Budget must be 0 or more.";
    }

    if (
      projectForm.startDate &&
      projectForm.deadline &&
      projectForm.deadline <
        projectForm.startDate
    ) {
      return "Deadline cannot be before the start date.";
    }

    if (
      projectForm.status ===
        "Completed" &&
      !projectForm.deadline
    ) {
      return "A completed project should have a deadline.";
    }

    return null;
  };

  const saveProject = async (e) => {
    e.preventDefault();

    if (saving) return;

    setError("");

    const validationError =
      validateProject();

    if (validationError) {
      setError(validationError);
      return;
    }

    const payload = {
      client_id:
        projectForm.clientId,

      name:
        projectForm.name.trim(),

      project_type:
        projectForm.projectType,

      status:
        projectForm.status,

      description:
        projectForm.description.trim() ||
        null,

      start_date:
        projectForm.startDate ||
        null,

      deadline:
        projectForm.deadline ||
        null,

      budget:
        Number(projectForm.budget),

      payment_status:
        projectForm.paymentStatus,

      notes:
        projectForm.notes.trim() ||
        null,

      updated_at:
        new Date().toISOString(),
    };

    setSaving(true);

    let result;

    if (editingProject) {
      result = await supabase
        .from("projects")
        .update(payload)
        .eq(
          "id",
          editingProject.id
        )
        .select()
        .single();
    } else {
      result = await supabase
        .from("projects")
        .insert(payload)
        .select()
        .single();
    }

    const { data, error } =
      result;

    if (error) {
      console.error(
        "SAVE PROJECT:",
        error
      );

      setError(
        error.message ||
          "Could not save the project."
      );

      setSaving(false);
      return;
    }

    if (editingProject) {
      setProjects((current) =>
        current.map((project) =>
          project.id === data.id
            ? data
            : project
        )
      );

      if (
        selectedProject?.id ===
        data.id
      ) {
        setSelectedProject(data);
      }
    } else {
      setProjects((current) => [
        data,
        ...current,
      ]);

      setSelectedProject(data);
    }

    setSaving(false);
    closeProjectModal();
  };

  const saveProjectTask = async (e) => {
    e.preventDefault();

    if (savingTask) return;

    setError("");

    const title = taskForm.title.trim();

    if (!taskForm.projectId) {
      setError("Select a project for this task.");
      return;
    }

    if (!title) {
      setError("Task title is required.");
      return;
    }

    const payload = {
      project_id: taskForm.projectId,
      title,
      stage: taskForm.stage,
      status: taskForm.status,
      assigned_to: taskForm.assignedTo.trim() || null,
      due_date: taskForm.dueDate || null,
      notes: taskForm.notes.trim() || null,
      updated_at: new Date().toISOString(),
    };

    setSavingTask(true);

    let result;

    if (editingTask) {
      result = await supabase
        .from("project_tasks")
        .update(payload)
        .eq("id", editingTask.id)
        .select()
        .single();
    } else {
      result = await supabase
        .from("project_tasks")
        .insert(payload)
        .select()
        .single();
    }

    const { data, error } = result;

    if (error) {
      console.error("SAVE PROJECT TASK:", error);
      setError(error.message || "Could not save the production task.");
      setSavingTask(false);
      return;
    }

    if (editingTask) {
      setProjectTasks((current) =>
        current.map((task) =>
          task.id === data.id ? data : task
        )
      );
    } else {
      setProjectTasks((current) => [data, ...current]);
    }

    setSavingTask(false);
    closeTaskModal();
  };

  const saveProjectPayment = async (e) => {
    e.preventDefault();

    if (savingPayment) return;

    setError("");

    const amount = Number(paymentForm.amount);

    if (!paymentForm.projectId) {
      setError("Select a project for this payment.");
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Payment amount must be greater than 0.");
      return;
    }

    const payload = {
      project_id: paymentForm.projectId,
      amount,
      payment_date: paymentForm.paymentDate || null,
      status: paymentForm.status,
      notes: paymentForm.notes.trim() || null,
      updated_at: new Date().toISOString(),
    };

    setSavingPayment(true);

    let result;

    if (editingPayment) {
      result = await supabase
        .from("project_payments")
        .update(payload)
        .eq("id", editingPayment.id)
        .select()
        .single();
    } else {
      result = await supabase
        .from("project_payments")
        .insert(payload)
        .select()
        .single();
    }

    const { data, error } = result;

    if (error) {
      console.error("SAVE PROJECT PAYMENT:", error);
      setError(error.message || "Could not save the project payment.");
      setSavingPayment(false);
      return;
    }

    if (editingPayment) {
      setProjectPayments((current) =>
        current.map((payment) =>
          payment.id === data.id ? data : payment
        )
      );
    } else {
      setProjectPayments((current) => [data, ...current]);
    }

    setSavingPayment(false);
    closePaymentModal();
  };

  const convertLeadToClient =
    async (lead) => {
      if (saving) return;

      if (lead.status !== "Won") {
        setError(
          "Only Won leads can be converted into clients."
        );
        return;
      }

      if (
        lead.converted_to_client_id
      ) {
        alert(
          "This lead has already been converted."
        );
        return;
      }

      const existingClient =
        clients.find(
          (client) =>
            client.company
              .trim()
              .toLowerCase() ===
            lead.company
              .trim()
              .toLowerCase()
        );

      if (existingClient) {
        alert(
          `${lead.company} already exists in Clients.`
        );
        return;
      }

      const confirmed =
        window.confirm(
          `Convert "${lead.company}" into a client?`
        );

      if (!confirmed) return;

      setSaving(true);
      setError("");

      const clientPayload = {
        company:
          lead.company,

        contact:
          lead.contact || null,

        phone:
          lead.phone || null,

        industry:
          lead.industry || null,

        monthly_value:
          Number(
            lead.value || 0
          ),

        contract_start:
          null,

        contract_end:
          null,

        payment_status:
          "Pending",

        status:
          "Active",

        notes:
          lead.notes || null,
      };

      const {
        data: newClient,
        error: clientError,
      } = await supabase
        .from("clients")
        .insert(
          clientPayload
        )
        .select()
        .single();

      if (clientError) {
        console.error(
          "CONVERT CLIENT:",
          clientError
        );

        setError(
          clientError.message ||
            "Could not create the client."
        );

        setSaving(false);
        return;
      }

      const {
        data: convertedLead,
        error: leadError,
      } = await supabase
        .from("leads")
        .update({
          converted_to_client_id:
            newClient.id,

          converted_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          lead.id
        )
        .is(
          "converted_to_client_id",
          null
        )
        .select()
        .single();

      if (leadError) {
        console.error(
          "CONVERT LEAD:",
          leadError
        );

        await supabase
          .from("clients")
          .delete()
          .eq(
            "id",
            newClient.id
          );

        setError(
          "Client creation was rolled back because the lead could not be marked as converted."
        );

        setSaving(false);
        return;
      }

      setClients((current) => [
        newClient,
        ...current,
      ]);

      setLeads((current) =>
        current.map((item) =>
          item.id ===
          convertedLead.id
            ? convertedLead
            : item
        )
      );

      setSaving(false);

      alert(
        `${lead.company} has been added to Clients.`
      );
    };

  const deleteLead = async (lead) => {
    if (
      saving ||
      deletingLeadId
    )
      return;

    const confirmed =
      window.confirm(
        `Delete "${lead.company}" permanently?\n\nThis cannot be undone.`
      );

    if (!confirmed) return;

    setDeletingLeadId(
      lead.id
    );
    setError("");

    const { error } =
      await supabase
        .from("leads")
        .delete()
        .eq(
          "id",
          lead.id
        );

    if (error) {
      console.error(
        "DELETE LEAD:",
        error
      );

      setError(
        error.message ||
          "Could not delete the lead."
      );

      setDeletingLeadId(null);
      return;
    }

    setLeads((current) =>
      current.filter(
        (item) =>
          item.id !== lead.id
      )
    );

    setDeletingLeadId(null);
  };

  const deleteProject =
    async (project) => {
      if (
        saving ||
        deletingProjectId
      )
        return;

      const confirmed =
        window.confirm(
          `Delete "${project.name}" permanently?\n\nThis cannot be undone.`
        );

      if (!confirmed) return;

      setDeletingProjectId(
        project.id
      );
      setError("");

      const { error } =
        await supabase
          .from("projects")
          .delete()
          .eq(
            "id",
            project.id
          );

      if (error) {
        console.error(
          "DELETE PROJECT:",
          error
        );

        setError(
          error.message ||
            "Could not delete the project."
        );

        setDeletingProjectId(
          null
        );
        return;
      }

      setProjects((current) =>
        current.filter(
          (item) =>
            item.id !==
            project.id
        )
      );

      setProjectTasks((current) =>
        current.filter(
          (task) => task.project_id !== project.id
        )
      );

      setProjectPayments((current) =>
        current.filter(
          (payment) => payment.project_id !== project.id
        )
      );

      if (
        selectedProject?.id ===
        project.id
      ) {
        setSelectedProject(null);
      }

      setDeletingProjectId(
        null
      );
    };

  const deleteProjectTask = async (task) => {
    if (savingTask || deletingTaskId) return;

    const confirmed = window.confirm(
      `Delete "${task.title}" permanently?\n\nThis cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingTaskId(task.id);
    setError("");

    const { error } = await supabase
      .from("project_tasks")
      .delete()
      .eq("id", task.id);

    if (error) {
      console.error("DELETE PROJECT TASK:", error);
      setError(error.message || "Could not delete the production task.");
      setDeletingTaskId(null);
      return;
    }

    setProjectTasks((current) =>
      current.filter((item) => item.id !== task.id)
    );
    setDeletingTaskId(null);
  };

  const quickUpdateTaskStatus = async (task, newStatus) => {
    const prevStatus = task.status;
    if (prevStatus === newStatus) return;

    setProjectTasks((current) =>
      current.map((item) =>
        item.id === task.id
          ? { ...item, status: newStatus, updated_at: new Date().toISOString() }
          : item
      )
    );

    const { error } = await supabase
      .from("project_tasks")
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", task.id);

    if (error) {
      console.error("QUICK UPDATE TASK STATUS:", error);
      setError(error.message || "Could not update task status.");
      setProjectTasks((current) =>
        current.map((item) =>
          item.id === task.id ? { ...item, status: prevStatus } : item
        )
      );
    }
  };

  const deleteProjectPayment = async (payment) => {
    if (savingPayment || deletingPaymentId) return;

    const confirmed = window.confirm(
      `Delete this NPR ${Number(payment.amount).toLocaleString()} payment record permanently?\n\nThis cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingPaymentId(payment.id);
    setError("");

    const { error } = await supabase
      .from("project_payments")
      .delete()
      .eq("id", payment.id);

    if (error) {
      console.error("DELETE PROJECT PAYMENT:", error);
      setError(error.message || "Could not delete the project payment.");
      setDeletingPaymentId(null);
      return;
    }

    setProjectPayments((current) =>
      current.filter((item) => item.id !== payment.id)
    );
    setDeletingPaymentId(null);
  };

  const statusCounts = useMemo(
    () => ({
      Prospect:
        leads.filter(
          (lead) =>
            lead.status ===
            "Prospect"
        ).length,

      Contacted:
        leads.filter(
          (lead) =>
            lead.status ===
            "Contacted"
        ).length,

      Meeting:
        leads.filter(
          (lead) =>
            lead.status ===
            "Meeting"
        ).length,

      Proposal:
        leads.filter(
          (lead) =>
            lead.status ===
            "Proposal"
        ).length,

      Won:
        leads.filter(
          (lead) =>
            lead.status ===
            "Won"
        ).length,

      Lost:
        leads.filter(
          (lead) =>
            lead.status ===
            "Lost"
        ).length,
    }),
    [leads]
  );

  const activeLeads =
    useMemo(
      () =>
        leads.filter(
          (lead) =>
            !lead.converted_to_client_id &&
            ![
              "Won",
              "Lost",
            ].includes(
              lead.status
            )
        ),
      [leads]
    );

  const historicalLeads =
    useMemo(
      () =>
        leads.filter(
          (lead) =>
            lead.converted_to_client_id ||
            [
              "Won",
              "Lost",
            ].includes(
              lead.status
            )
        ),
      [leads]
    );

  const visibleLeads =
    leadView === "active"
      ? activeLeads
      : historicalLeads;

  const activeClients =
    clients.filter(
      (client) =>
        client.status ===
        "Active"
    );

  const monthlyRevenue =
    activeClients.reduce(
      (sum, client) =>
        sum +
        Number(
          client.monthly_value ||
            0
        ),
      0
    );

  const potentialValue =
    activeLeads.reduce(
      (sum, lead) =>
        sum +
        Number(
          lead.value || 0
        ),
      0
    );

  const followUpsToday =
    useMemo(() => {
      const today =
        new Date()
          .toISOString()
          .slice(0, 10);

      return activeLeads.filter(
        (lead) =>
          lead.follow_up ===
          today
      ).length;
    }, [activeLeads]);

  const activeProjects =
    projects.filter(
      (project) =>
        ![
          "Completed",
          "Cancelled",
        ].includes(
          project.status
        )
    );

  const productionProject =
    selectedProject || projects[0] || null;

  const productionTasks = productionProject
    ? projectTasks.filter(
        (task) =>
          String(task.project_id) ===
          String(productionProject.id)
      )
    : [];

  const completedTasks = projectTasks.filter(
    (task) => task.status === "Done"
  );

  const totalProjectBudget = projects.reduce(
    (sum, project) => sum + Number(project.budget || 0),
    0
  );

  const paymentsReceived = projectPayments
    .filter((payment) => payment.status === "Paid")
    .reduce(
      (sum, payment) => sum + Number(payment.amount || 0),
      0
    );

  const outstandingProjectBalance = Math.max(
    totalProjectBudget - paymentsReceived,
    0
  );

  const projectBudget =
    projects.reduce(
      (sum, project) =>
        sum +
        Number(
          project.budget || 0
        ),
      0
    );

  const getClientName =
    (clientId) => {
      const client =
        clients.find(
          (item) =>
            String(item.id) ===
            String(clientId)
        );

      return (
        client?.company ||
        "Unknown client"
      );
    };

  const getProjectName = (projectId) => {
    const project = projects.find(
      (item) => String(item.id) === String(projectId)
    );

    return project?.name || "Unknown project";
  };

  const calendarItems = [
    ...projects
      .filter((project) => project.deadline)
      .map((project) => ({
        id: `project-${project.id}`,
        date: project.deadline,
        title: project.name,
        category: "deadline",
        type: "Project Deadline",
        detail: getClientName(project.client_id),
        meta: `Budget: NPR ${Number(project.budget || 0).toLocaleString()} • ${project.status}`,
        targetPage: "Projects",
        projectObj: project,
      })),
    ...projectTasks
      .filter((task) => task.due_date)
      .map((task) => ({
        id: `task-${task.id}`,
        date: task.due_date,
        title: task.title,
        category: "task",
        type: task.stage,
        detail: getProjectName(task.project_id),
        meta: `Status: ${task.status} • Assigned: ${task.assigned_to || "Unassigned"}`,
        targetPage: "Production",
        taskObj: task,
      })),
    ...leads
      .filter((lead) => lead.follow_up)
      .map((lead) => ({
        id: `lead-${lead.id}`,
        date: lead.follow_up,
        title: `Follow up: ${lead.company}`,
        category: "lead",
        type: "Lead Follow-up",
        detail: lead.contact
          ? `${lead.contact} (${lead.phone || "No phone"})`
          : lead.industry || "Lead",
        meta: `Status: ${lead.status} • Value: NPR ${Number(lead.value || 0).toLocaleString()}`,
        targetPage: "Leads",
        leadObj: lead,
      })),
  ].sort((first, second) => first.date.localeCompare(second.date));

  const filteredCalendarItems = calendarItems.filter((item) => {
    if (calendarFilter === "all") return true;
    if (calendarFilter === "deadlines") return item.category === "deadline";
    if (calendarFilter === "tasks") return item.category === "task";
    if (calendarFilter === "leads") return item.category === "lead";
    return true;
  });

  const todayStr = new Date().toISOString().slice(0, 10);
  const nextWeekDate = new Date();
  nextWeekDate.setDate(nextWeekDate.getDate() + 7);
  const nextWeekStr = nextWeekDate.toISOString().slice(0, 10);

  const overdueAndTodayItems = filteredCalendarItems.filter(
    (item) => item.date <= todayStr
  );
  const thisWeekItems = filteredCalendarItems.filter(
    (item) => item.date > todayStr && item.date <= nextWeekStr
  );
  const upcomingItems = filteredCalendarItems.filter(
    (item) => item.date > nextWeekStr
  );

  const getLeadButtonText =
    () => {
      if (saving)
        return "Saving...";

      if (!editingLead) {
        if (
          leadForm.status ===
          "Won"
        ) {
          return "Save & Mark Won";
        }

        if (
          leadForm.status ===
          "Lost"
        ) {
          return "Save as Lost";
        }

        return "Add Lead";
      }

      if (
        leadForm.status ===
        "Won"
      ) {
        return "Save as Won";
      }

      if (
        leadForm.status ===
        "Lost"
      ) {
        return "Save as Lost";
      }

      return "Save Changes";
    };

  if (authLoading) {
    return (
      <div className="auth-screen">
        <div className="auth-card">
          <div className="logo">
            AURA<span>OS</span>
          </div>

          <p className="eyebrow">
            AURA FILMS
          </p>

          <h1>
            Loading...
          </h1>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="auth-screen">
        <div className="auth-card">
          <div className="logo auth-logo">
            AURA<span>OS</span>
          </div>

          <p className="eyebrow">
            AURA FILMS
          </p>

          <h1>
            Sign in
          </h1>

          <p className="auth-description">
            Internal system for
            Aura Films.
          </p>

          <form
            onSubmit={
              handleLogin
            }
          >
            <label>
              Email

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(
                    e.target.value
                  )
                }
                placeholder="Aura Films email"
                autoComplete="email"
                required
              />
            </label>

            <label>
              Password

              <input
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
                placeholder="Password"
                autoComplete="current-password"
                required
              />
            </label>

            {loginError && (
              <div className="form-error">
                {loginError}
              </div>
            )}

            <button
              className="submit-button"
              type="submit"
              disabled={
                loggingIn
              }
            >
              {loggingIn
                ? "Signing in..."
                : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="mobile-header">
        <div className="logo">
          AURA<span>OS</span>
        </div>
        <div className="mobile-header-actions">
          <span className="mobile-user-email">
            {session?.user?.email?.split("@")[0] || "Aura"}
          </span>
          <button className="mobile-logout-button" onClick={handleLogout} type="button">
            Sign out
          </button>
        </div>
      </header>

      <aside className="sidebar">
        <div className="logo">
          AURA<span>OS</span>
        </div>

        <nav>
          {[
            "Dashboard",
            "Leads",
            "Clients",
            "Projects",
            "Production",
            "Finance",
            "Calendar",
          ].map((page) => (
            <button
              key={page}
              className={`nav-item ${
                activePage ===
                page
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setActivePage(
                  page
                )
              }
            >
              {page}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <p>
            Aura Films
            Pvt. Ltd.
          </p>

          <span>
            Internal System
          </span>

          <button
            className="logout-button"
            onClick={
              handleLogout
            }
          >
            Sign out
          </button>
        </div>
      </aside>

      <main className="main">
        {error && (
          <div className="global-error">
            <span>
              {error}
            </span>

            <button
              onClick={() =>
                setError("")
              }
            >
              ×
            </button>
          </div>
        )}

        {activePage ===
          "Dashboard" && (
          <>
            <header className="topbar">
              <div>
                <p className="eyebrow">
                  AURA FILMS
                </p>

                <h1>
                  Good morning,
                  Aura Films.
                </h1>
              </div>

              <button className="profile">
                A
              </button>
            </header>

            <section className="stats">
              <div className="stat-card">
                <span>
                  Active Clients
                </span>

                <strong>
                  {
                    activeClients.length
                  }
                </strong>
              </div>

              <div className="stat-card">
                <span>
                  Monthly Revenue
                </span>

                <strong>
                  NPR{" "}
                  {monthlyRevenue.toLocaleString()}
                </strong>
              </div>

              <div className="stat-card">
                <span>
                  Active Leads
                </span>

                <strong>
                  {
                    activeLeads.length
                  }
                </strong>
              </div>

              <div className="stat-card">
                <span>
                  Active Projects
                </span>

                <strong>
                  {
                    activeProjects.length
                  }
                </strong>
              </div>
            </section>

            <section className="dashboard-grid">
              <div className="panel">
                <div className="panel-header">
                  <div>
                    <p className="eyebrow">
                      PIPELINE
                    </p>

                    <h2>
                      Sales Overview
                    </h2>
                  </div>

                  <button
                    className="small-button"
                    onClick={() => {
                      setActivePage(
                        "Leads"
                      );
                      openNewLeadModal();
                    }}
                  >
                    + Add Lead
                  </button>
                </div>

                <div className="pipeline">
                  <div>
                    <span>
                      Prospects
                    </span>

                    <strong>
                      {
                        statusCounts.Prospect
                      }
                    </strong>
                  </div>

                  <div>
                    <span>
                      Contacted
                    </span>

                    <strong>
                      {
                        statusCounts.Contacted
                      }
                    </strong>
                  </div>

                  <div>
                    <span>
                      Meetings
                    </span>

                    <strong>
                      {
                        statusCounts.Meeting
                      }
                    </strong>
                  </div>

                  <div>
                    <span>
                      Proposals
                    </span>

                    <strong>
                      {
                        statusCounts.Proposal
                      }
                    </strong>
                  </div>

                  <div>
                    <span>
                      Won
                    </span>

                    <strong>
                      {
                        statusCounts.Won
                      }
                    </strong>
                  </div>
                </div>
              </div>

              <div className="panel">
                <div className="panel-header">
                  <div>
                    <p className="eyebrow">
                      PRODUCTION
                    </p>

                    <h2>
                      Projects
                    </h2>
                  </div>

                  <button
                    className="small-button"
                    onClick={() =>
                      setActivePage(
                        "Projects"
                      )
                    }
                  >
                    View Projects
                  </button>
                </div>

                <div className="empty-state">
                  {activeProjects.length >
                  0 ? (
                    <>
                      <strong>
                        {
                          activeProjects.length
                        }{" "}
                        active project
                        {activeProjects.length ===
                        1
                          ? ""
                          : "s"}
                      </strong>

                      <p>
                        Total project
                        budget: NPR{" "}
                        {projectBudget.toLocaleString()}
                      </p>
                    </>
                  ) : (
                    <>
                      <strong>
                        No active
                        projects.
                      </strong>

                      <p>
                        Convert a client
                        into a project
                        when production
                        begins.
                      </p>
                    </>
                  )}
                </div>
              </div>
            </section>
          </>
        )}

        {activePage ===
          "Leads" && (
          <>
            <header className="topbar">
              <div>
                <p className="eyebrow">
                  SALES
                </p>

                <h1>
                  Leads
                </h1>
              </div>

              <button
                className="small-button"
                onClick={
                  openNewLeadModal
                }
              >
                + Add Lead
              </button>
            </header>

            <section className="stats">
              <div className="stat-card">
                <span>
                  Active Leads
                </span>

                <strong>
                  {
                    activeLeads.length
                  }
                </strong>
              </div>

              <div className="stat-card">
                <span>
                  Pipeline Value
                </span>

                <strong>
                  NPR{" "}
                  {potentialValue.toLocaleString()}
                </strong>
              </div>

              <div className="stat-card">
                <span>
                  Won
                </span>

                <strong>
                  {
                    statusCounts.Won
                  }
                </strong>
              </div>

              <div className="stat-card">
                <span>
                  Lost
                </span>

                <strong>
                  {
                    statusCounts.Lost
                  }
                </strong>
              </div>
            </section>

            <section className="panel">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">
                    PIPELINE
                  </p>

                  <h2>
                    {leadView ===
                    "active"
                      ? "Active Leads"
                      : "Lead History"}
                  </h2>
                </div>

                <div className="view-toggle">
                  <button
                    className={
                      leadView ===
                      "active"
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setLeadView(
                        "active"
                      )
                    }
                  >
                    Active
                  </button>

                  <button
                    className={
                      leadView ===
                      "history"
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setLeadView(
                        "history"
                      )
                    }
                  >
                    History
                  </button>
                </div>
              </div>

              {loadingLeads ? (
                <div className="empty-state">
                  <strong>
                    Loading
                    leads...
                  </strong>
                </div>
              ) : visibleLeads.length ===
                0 ? (
                <div className="empty-state">
                  <strong>
                    {leadView ===
                    "active"
                      ? "No active leads."
                      : "No lead history yet."}
                  </strong>

                  <p>
                    {leadView ===
                    "active"
                      ? "Add a prospect to start building Aura's sales pipeline."
                      : "Won and lost leads will appear here."}
                  </p>
                </div>
              ) : (
                <div className="lead-list">
                  {visibleLeads.map(
                    (lead) => (
                      <div
                        className="lead-row"
                        key={
                          lead.id
                        }
                      >
                        <div>
                          <strong>
                            {
                              lead.company
                            }
                          </strong>

                          <span>
                            {lead.contact ||
                              "No contact"}{" "}
                            ·{" "}
                            {lead.industry ||
                              "No industry"}
                          </span>
                        </div>

                        <div>
                          <span
                            className={`status ${(
                              lead.status ||
                              ""
                            ).toLowerCase()}`}
                          >
                            {lead.converted_to_client_id
                              ? "Converted"
                              : lead.status}
                          </span>
                        </div>

                        <div>
                          <strong>
                            NPR{" "}
                            {Number(
                              lead.value ||
                                0
                            ).toLocaleString()}
                          </strong>

                          <span>
                            {lead.converted_to_client_id
                              ? "Client created"
                              : lead.status ===
                                "Lost"
                              ? `Lost: ${
                                  lead.lost_reason ||
                                  "No reason"
                                }`
                              : `Follow-up: ${
                                  lead.follow_up ||
                                  "Not set"
                                }`}
                          </span>
                        </div>

                        <div className="row-actions">
                          {!lead.converted_to_client_id && (
                            <button
                              className="small-button"
                              onClick={() =>
                                openEditLeadModal(
                                  lead
                                )
                              }
                            >
                              Edit
                            </button>
                          )}

                          {lead.status ===
                            "Won" &&
                            !lead.converted_to_client_id && (
                              <button
                                className="small-button"
                                onClick={() =>
                                  convertLeadToClient(
                                    lead
                                  )
                                }
                                disabled={
                                  saving
                                }
                              >
                                Convert
                              </button>
                            )}

                          {!lead.converted_to_client_id && (
                            <button
                              className="danger-button"
                              onClick={() =>
                                deleteLead(
                                  lead
                                )
                              }
                              disabled={
                                deletingLeadId ===
                                lead.id
                              }
                            >
                              {deletingLeadId ===
                              lead.id
                                ? "Deleting..."
                                : "Delete"}
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </section>
          </>
        )}

        {activePage ===
          "Clients" && (
          <>
            <header className="topbar">
              <div>
                <p className="eyebrow">
                  BUSINESS
                </p>

                <h1>
                  Clients
                </h1>
              </div>

              <button
                className="small-button"
                onClick={
                  openNewClientModal
                }
              >
                + Add Client
              </button>
            </header>

            <section className="stats">
              <div className="stat-card">
                <span>
                  Active Clients
                </span>

                <strong>
                  {
                    activeClients.length
                  }
                </strong>
              </div>

              <div className="stat-card">
                <span>
                  Monthly Revenue
                </span>

                <strong>
                  NPR{" "}
                  {monthlyRevenue.toLocaleString()}
                </strong>
              </div>

              <div className="stat-card">
                <span>
                  Pending Payments
                </span>

                <strong>
                  {
                    clients.filter(
                      (
                        client
                      ) =>
                        client.payment_status ===
                        "Pending"
                    ).length
                  }
                </strong>
              </div>

              <div className="stat-card">
                <span>
                  Total Clients
                </span>

                <strong>
                  {
                    clients.length
                  }
                </strong>
              </div>
            </section>

            <section className="panel">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">
                    CLIENT BASE
                  </p>

                  <h2>
                    All Clients
                  </h2>
                </div>
              </div>

              {loadingClients ? (
                <div className="empty-state">
                  <strong>
                    Loading
                    clients...
                  </strong>
                </div>
              ) : clients.length ===
                0 ? (
                <div className="empty-state">
                  <strong>
                    No clients yet.
                  </strong>

                  <p>
                    Won leads can be
                    converted into
                    clients without
                    re-entering their
                    information.
                  </p>
                </div>
              ) : (
                <div className="lead-list">
                  {clients.map(
                    (client) => (
                      <div
                        className="lead-row"
                        key={
                          client.id
                        }
                      >
                        <div>
                          <strong>
                            {
                              client.company
                            }
                          </strong>

                          <span>
                            {client.contact ||
                              "No contact"}{" "}
                            ·{" "}
                            {client.industry ||
                              "No industry"}
                          </span>
                        </div>

                        <div>
                          <span
                            className={`status ${(
                              client.status ||
                              ""
                            ).toLowerCase()}`}
                          >
                            {
                              client.status
                            }
                          </span>
                        </div>

                        <div>
                          <strong>
                            NPR{" "}
                            {Number(
                              client.monthly_value ||
                                0
                            ).toLocaleString()}
                            /month
                          </strong>

                          <span>
                            Payment:{" "}
                            {
                              client.payment_status
                            }
                          </span>
                        </div>

                        <div>
                          <button
                            className="small-button"
                            onClick={() => {
                              setActivePage(
                                "Projects"
                              );

                              setTimeout(
                                () => {
                                  openNewProjectModal();
                                },
                                0
                              );

                              setProjectForm({
                                ...emptyProjectForm,
                                clientId:
                                  String(
                                    client.id
                                  ),
                              });
                            }}
                          >
                            + Project
                          </button>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </section>
          </>
        )}

        {activePage ===
          "Projects" && (
          <>
            <header className="topbar">
              <div>
                <p className="eyebrow">
                  PRODUCTION
                </p>

                <h1>
                  Projects
                </h1>
              </div>

              <button
                className="small-button"
                onClick={
                  openNewProjectModal
                }
                disabled={
                  clients.length ===
                  0
                }
              >
                + New Project
              </button>
            </header>

            <section className="stats">
              <div className="stat-card">
                <span>
                  Active Projects
                </span>

                <strong>
                  {
                    activeProjects.length
                  }
                </strong>
              </div>

              <div className="stat-card">
                <span>
                  Total Projects
                </span>

                <strong>
                  {
                    projects.length
                  }
                </strong>
              </div>

              <div className="stat-card">
                <span>
                  Project Budget
                </span>

                <strong>
                  NPR{" "}
                  {projectBudget.toLocaleString()}
                </strong>
              </div>

              <div className="stat-card">
                <span>
                  Completed
                </span>

                <strong>
                  {
                    projects.filter(
                      (
                        project
                      ) =>
                        project.status ===
                        "Completed"
                    ).length
                  }
                </strong>
              </div>
            </section>

            {clients.length ===
              0 && (
              <section className="panel">
                <div className="empty-state">
                  <strong>
                    Add a client
                    first.
                  </strong>

                  <p>
                    Every project
                    needs to belong
                    to a client.
                  </p>

                  <button
                    className="small-button"
                    onClick={() =>
                      setActivePage(
                        "Clients"
                      )
                    }
                  >
                    Go to Clients
                  </button>
                </div>
              </section>
            )}

            {clients.length >
              0 && (
              <section className="projects-layout">
                <div className="panel">
                  <div className="panel-header">
                    <div>
                      <p className="eyebrow">
                        WORK
                      </p>

                      <h2>
                        All Projects
                      </h2>
                    </div>
                  </div>

                  {loadingProjects ? (
                    <div className="empty-state">
                      <strong>
                        Loading
                        projects...
                      </strong>
                    </div>
                  ) : projects.length ===
                    0 ? (
                    <div className="empty-state">
                      <strong>
                        No projects
                        yet.
                      </strong>

                      <p>
                        Create the
                        first project
                        from an existing
                        client.
                      </p>
                    </div>
                  ) : (
                    <div className="project-list">
                      {projects.map(
                        (
                          project
                        ) => (
                          <button
                            key={
                              project.id
                            }
                            className={`project-card ${
                              selectedProject?.id ===
                              project.id
                                ? "selected"
                                : ""
                            }`}
                            onClick={() =>
                              setSelectedProject(
                                project
                              )
                            }
                          >
                            <div>
                              <strong>
                                {
                                  project.name
                                }
                              </strong>

                              <span>
                                {getClientName(
                                  project.client_id
                                )}
                              </span>
                            </div>

                            <div>
                              <span
                                className={`status ${(
                                  project.status ||
                                  ""
                                )
                                  .toLowerCase()
                                  .replace(
                                    /\s/g,
                                    "-"
                                  )}`}
                              >
                                {
                                  project.status
                                }
                              </span>

                              <strong>
                                NPR{" "}
                                {Number(
                                  project.budget ||
                                    0
                                ).toLocaleString()}
                              </strong>
                            </div>
                          </button>
                        )
                      )}
                    </div>
                  )}
                </div>

                <div className="panel project-detail-panel">
                  {!selectedProject ? (
                    <div className="empty-state">
                      <strong>
                        Select a project.
                      </strong>

                      <p>
                        Project details
                        will appear here.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="panel-header">
                        <div>
                          <p className="eyebrow">
                            PROJECT
                          </p>

                          <h2>
                            {
                              selectedProject.name
                            }
                          </h2>
                        </div>

                        <div className="row-actions">
                          <button
                            className="small-button"
                            onClick={() =>
                              setActivePage(
                                "Production"
                              )
                            }
                          >
                            View Tasks
                          </button>

                          <button
                            className="small-button"
                            onClick={() =>
                              openEditProjectModal(
                                selectedProject
                              )
                            }
                          >
                            Edit
                          </button>

                          <button
                            className="danger-button"
                            onClick={() =>
                              deleteProject(
                                selectedProject
                              )
                            }
                            disabled={
                              deletingProjectId ===
                              selectedProject.id
                            }
                          >
                            {deletingProjectId ===
                            selectedProject.id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </div>
                      </div>

                      <div className="project-details">
                        <div>
                          <span>
                            Client
                          </span>

                          <strong>
                            {getClientName(
                              selectedProject.client_id
                            )}
                          </strong>
                        </div>

                        <div>
                          <span>
                            Type
                          </span>

                          <strong>
                            {
                              selectedProject.project_type
                            }
                          </strong>
                        </div>

                        <div>
                          <span>
                            Status
                          </span>

                          <strong>
                            {
                              selectedProject.status
                            }
                          </strong>
                        </div>

                        <div>
                          <span>
                            Budget
                          </span>

                          <strong>
                            NPR{" "}
                            {Number(
                              selectedProject.budget ||
                                0
                            ).toLocaleString()}
                          </strong>
                        </div>

                        <div>
                          <span>
                            Start Date
                          </span>

                          <strong>
                            {
                              selectedProject.start_date ||
                              "Not set"
                            }
                          </strong>
                        </div>

                        <div>
                          <span>
                            Deadline
                          </span>

                          <strong>
                            {
                              selectedProject.deadline ||
                              "Not set"
                            }
                          </strong>
                        </div>

                        <div>
                          <span>
                            Payment
                          </span>

                          <strong>
                            {
                              selectedProject.payment_status
                            }
                          </strong>
                        </div>

                        <div>
                          <span>
                            Production Tasks
                          </span>

                          <strong>
                            {
                              projectTasks.filter(
                                (task) =>
                                  String(
                                    task.project_id
                                  ) ===
                                  String(
                                    selectedProject.id
                                  )
                              ).length
                            }
                          </strong>
                        </div>

                        <div>
                          <span>
                            Tasks Done
                          </span>

                          <strong>
                            {
                              projectTasks.filter(
                                (task) =>
                                  String(
                                    task.project_id
                                  ) ===
                                    String(
                                      selectedProject.id
                                    ) &&
                                  task.status === "Done"
                              ).length
                            }
                          </strong>
                        </div>
                      </div>

                      {selectedProject.description && (
                        <div className="detail-block">
                          <span>
                            Description
                          </span>

                          <p>
                            {
                              selectedProject.description
                            }
                          </p>
                        </div>
                      )}

                      {selectedProject.notes && (
                        <div className="detail-block">
                          <span>
                            Notes
                          </span>

                          <p>
                            {
                              selectedProject.notes
                            }
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </section>
            )}
          </>
        )}

        {activePage === "Production" && (
          <>
            <header className="topbar">
              <div>
                <p className="eyebrow">PRODUCTION</p>
                <h1>Production Tasks</h1>
              </div>

              <button
                className="small-button"
                onClick={() => openNewTaskModal()}
                disabled={projects.length === 0}
              >
                + New Task
              </button>
            </header>

            <section className="stats">
              <div className="stat-card">
                <span>Total Tasks</span>
                <strong>{projectTasks.length}</strong>
              </div>

              <div className="stat-card">
                <span>To Do</span>
                <strong>
                  {
                    projectTasks.filter(
                      (task) => task.status === "To Do"
                    ).length
                  }
                </strong>
              </div>

              <div className="stat-card">
                <span>In Progress</span>
                <strong>
                  {
                    projectTasks.filter(
                      (task) => task.status === "In Progress"
                    ).length
                  }
                </strong>
              </div>

              <div className="stat-card">
                <span>Done</span>
                <strong>{completedTasks.length}</strong>
              </div>
            </section>

            {projects.length === 0 ? (
              <section className="panel">
                <div className="empty-state">
                  <strong>Create a project first.</strong>
                  <p>
                    Production tasks belong to a project, so create a project before adding work.
                  </p>
                  <button
                    className="small-button"
                    onClick={() => setActivePage("Projects")}
                  >
                    Go to Projects
                  </button>
                </div>
              </section>
            ) : (
              <section className="production-layout">
                <div className="panel">
                  <div className="panel-header">
                    <div>
                      <p className="eyebrow">PROJECTS</p>
                      <h2>Choose a project</h2>
                    </div>
                  </div>

                  <div className="project-list">
                    {projects.map((project) => (
                      <button
                        key={project.id}
                        className={`project-card ${
                          productionProject?.id === project.id ? "selected" : ""
                        }`}
                        onClick={() => setSelectedProject(project)}
                      >
                        <div>
                          <strong>{project.name}</strong>
                          <span>{getClientName(project.client_id)}</span>
                        </div>
                        <span className="status">
                          {
                            projectTasks.filter(
                              (task) =>
                                String(task.project_id) === String(project.id)
                            ).length
                          } tasks
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="panel production-tasks-panel">
                  <div className="panel-header">
                    <div>
                      <p className="eyebrow">TASKS</p>
                      <h2>{productionProject?.name}</h2>
                    </div>

                    <button
                      className="small-button"
                      onClick={() => openNewTaskModal(productionProject)}
                    >
                      + Task
                    </button>
                  </div>

                  {loadingTasks ? (
                    <div className="empty-state">
                      <strong>Loading production tasks...</strong>
                    </div>
                  ) : productionTasks.length === 0 ? (
                    <div className="empty-state">
                      <strong>No tasks yet.</strong>
                      <p>
                        Add the first task for this project, such as a brief, shoot, edit, or final delivery.
                      </p>
                    </div>
                  ) : (
                    <div className="task-list">
                      {TASK_STAGES.map((stage) => {
                        const stageTasks = productionTasks.filter(
                          (task) => task.stage === stage
                        );

                        return (
                          <section className="task-stage" key={stage}>
                            <div className="task-stage-header">
                              <h3>{stage}</h3>
                              <span>{stageTasks.length}</span>
                            </div>

                            {stageTasks.length === 0 ? (
                              <p className="task-stage-empty">No tasks in this stage.</p>
                            ) : (
                              stageTasks.map((task) => (
                                <article className="task-card" key={task.id}>
                                  <div className="task-card-main">
                                    <div>
                                      <select
                                        className={`status-select task-status ${task.status
                                          .toLowerCase()
                                          .replace(/\s/g, "-")}`}
                                        value={task.status}
                                        onChange={(e) =>
                                          quickUpdateTaskStatus(task, e.target.value)
                                        }
                                        title="Click to change status immediately"
                                      >
                                        {TASK_STATUSES.map((status) => (
                                          <option key={status} value={status}>
                                            {status}
                                          </option>
                                        ))}
                                      </select>
                                      <h3>{task.title}</h3>
                                    </div>

                                    <div className="row-actions">
                                      <button
                                        className="text-button"
                                        onClick={() => openEditTaskModal(task)}
                                      >
                                        Edit
                                      </button>
                                      <button
                                        className="text-button danger-text-button"
                                        onClick={() => deleteProjectTask(task)}
                                        disabled={deletingTaskId === task.id}
                                      >
                                        {deletingTaskId === task.id ? "Deleting..." : "Delete"}
                                      </button>
                                    </div>
                                  </div>

                                  <div className="task-meta">
                                    <span>Assigned: {task.assigned_to || "Unassigned"}</span>
                                    <span>Due: {task.due_date || "Not set"}</span>
                                  </div>

                                  {task.notes && <p>{task.notes}</p>}
                                </article>
                              ))
                            )}
                          </section>
                        );
                      })}
                    </div>
                  )}
                </div>
              </section>
            )}
          </>
        )}

        {activePage === "Finance" && (
          <>
            <header className="topbar">
              <div>
                <p className="eyebrow">FINANCE & BILLING</p>
                <h1>Financial Overview</h1>
              </div>

              <button
                className="small-button"
                onClick={() => openNewPaymentModal()}
                disabled={projects.length === 0}
              >
                + Record Payment
              </button>
            </header>

            <section className="stats">
              <div className="stat-card">
                <span>Total Project Budgets</span>
                <strong>NPR {totalProjectBudget.toLocaleString()}</strong>
              </div>

              <div className="stat-card">
                <span>Payments Received</span>
                <strong style={{ color: "#16a34a" }}>
                  NPR {paymentsReceived.toLocaleString()}
                </strong>
              </div>

              <div className="stat-card">
                <span>Outstanding Balance</span>
                <strong
                  style={{
                    color: outstandingProjectBalance > 0 ? "#dc2626" : "#111",
                  }}
                >
                  NPR {outstandingProjectBalance.toLocaleString()}
                </strong>
              </div>

              <div className="stat-card">
                <span>Collection Rate</span>
                <strong>
                  {totalProjectBudget > 0
                    ? `${Math.round((paymentsReceived / totalProjectBudget) * 100)}%`
                    : "0%"}
                </strong>
              </div>
            </section>

            <div className="dashboard-grid">
              <div className="panel">
                <div className="panel-header">
                  <div>
                    <p className="eyebrow">PROJECT BILLING</p>
                    <h2>Projects Breakdown</h2>
                  </div>
                </div>

                {projects.length === 0 ? (
                  <div className="empty-state">
                    <strong>No projects found.</strong>
                    <p>Create projects first to manage payments and billing.</p>
                  </div>
                ) : (
                  <div className="finance-project-list">
                    {projects.map((project) => {
                      const budget = Number(project.budget || 0);
                      const paid = projectPayments
                        .filter(
                          (p) =>
                            String(p.project_id) === String(project.id) &&
                            p.status === "Paid"
                        )
                        .reduce((sum, p) => sum + Number(p.amount || 0), 0);
                      const balance = Math.max(budget - paid, 0);
                      const percent =
                        budget > 0
                          ? Math.min(Math.round((paid / budget) * 100), 100)
                          : 0;

                      return (
                        <div className="finance-project-card" key={project.id}>
                          <div className="finance-project-header">
                            <div>
                              <strong>{project.name}</strong>
                              <span className="subtext">
                                {getClientName(project.client_id)} •{" "}
                                {project.project_type}
                              </span>
                            </div>
                            <button
                              className="text-button"
                              onClick={() => openNewPaymentModal(project)}
                            >
                              + Payment
                            </button>
                          </div>

                          <div className="progress-bar-container">
                            <div
                              className="progress-bar-fill"
                              style={{ width: `${percent}%` }}
                            />
                          </div>

                          <div className="finance-metrics">
                            <div>
                              <span className="metric-label">Budget</span>
                              <span className="metric-value">
                                NPR {budget.toLocaleString()}
                              </span>
                            </div>
                            <div>
                              <span className="metric-label">Paid</span>
                              <span className="metric-value paid">
                                NPR {paid.toLocaleString()} ({percent}%)
                              </span>
                            </div>
                            <div>
                              <span className="metric-label">Remaining</span>
                              <span
                                className={`metric-value ${
                                  balance > 0 ? "balance" : "cleared"
                                }`}
                              >
                                NPR {balance.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="panel">
                <div className="panel-header">
                  <div>
                    <p className="eyebrow">LEDGER</p>
                    <h2>Payment History ({projectPayments.length})</h2>
                  </div>
                </div>

                {loadingPayments ? (
                  <div className="empty-state">
                    <strong>Loading payments...</strong>
                  </div>
                ) : projectPayments.length === 0 ? (
                  <div className="empty-state">
                    <strong>No payments recorded.</strong>
                    <p>
                      Click "+ Record Payment" to track advances, installments,
                      or completed payouts.
                    </p>
                  </div>
                ) : (
                  <div className="payment-history-list">
                    {projectPayments.map((payment) => (
                      <div className="payment-entry-card" key={payment.id}>
                        <div className="payment-entry-top">
                          <div>
                            <strong>
                              NPR {Number(payment.amount).toLocaleString()}
                            </strong>
                            <span
                              className={`status payment-status ${payment.status
                                .toLowerCase()
                                .replace(/\s/g, "-")}`}
                            >
                              {payment.status}
                            </span>
                          </div>

                          <div className="row-actions">
                            <button
                              className="text-button"
                              onClick={() => openEditPaymentModal(payment)}
                            >
                              Edit
                            </button>
                            <button
                              className="text-button danger-text-button"
                              onClick={() => deleteProjectPayment(payment)}
                              disabled={deletingPaymentId === payment.id}
                            >
                              {deletingPaymentId === payment.id
                                ? "..."
                                : "Delete"}
                            </button>
                          </div>
                        </div>

                        <div className="payment-entry-meta">
                          <span>
                            📁 {getProjectName(payment.project_id)}
                          </span>
                          <span>
                            📅 {payment.payment_date || "No date"}
                          </span>
                        </div>

                        {payment.notes && (
                          <p className="payment-entry-notes">{payment.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {activePage === "Calendar" && (
          <>
            <header className="topbar">
              <div>
                <p className="eyebrow">SCHEDULE & DEADLINES</p>
                <h1>Calendar Agenda</h1>
              </div>

              <div className="calendar-filter-pills">
                {[
                  { id: "all", label: `All (${calendarItems.length})` },
                  {
                    id: "deadlines",
                    label: `Deadlines (${
                      calendarItems.filter((i) => i.category === "deadline")
                        .length
                    })`,
                  },
                  {
                    id: "tasks",
                    label: `Tasks (${
                      calendarItems.filter((i) => i.category === "task").length
                    })`,
                  },
                  {
                    id: "leads",
                    label: `Follow-ups (${
                      calendarItems.filter((i) => i.category === "lead").length
                    })`,
                  },
                ].map((pill) => (
                  <button
                    key={pill.id}
                    className={`filter-pill ${
                      calendarFilter === pill.id ? "active" : ""
                    }`}
                    onClick={() => setCalendarFilter(pill.id)}
                  >
                    {pill.label}
                  </button>
                ))}
              </div>
            </header>

            <div className="calendar-sections">
              {overdueAndTodayItems.length > 0 && (
                <section className="panel calendar-panel urgent-panel">
                  <div className="panel-header">
                    <div>
                      <p className="eyebrow" style={{ color: "#dc2626" }}>
                        ACTION REQUIRED
                      </p>
                      <h2>Today & Overdue ({overdueAndTodayItems.length})</h2>
                    </div>
                  </div>

                  <div className="agenda-list">
                    {overdueAndTodayItems.map((item) => (
                      <div
                        className={`agenda-card ${
                          item.date < todayStr ? "is-overdue" : "is-today"
                        }`}
                        key={item.id}
                      >
                        <div className="agenda-date-badge">
                          <span className="agenda-date-label">
                            {item.date < todayStr ? "OVERDUE" : "TODAY"}
                          </span>
                          <strong>{item.date}</strong>
                        </div>

                        <div className="agenda-info">
                          <div className="agenda-title-row">
                            <span className="agenda-type-badge">
                              {item.type}
                            </span>
                            <h3>{item.title}</h3>
                          </div>
                          <p className="agenda-detail">{item.detail}</p>
                          <span className="agenda-meta">{item.meta}</span>
                        </div>

                        <button
                          className="small-button agenda-jump-button"
                          onClick={() => {
                            if (item.category === "deadline") {
                              setSelectedProject(item.projectObj);
                              setActivePage("Projects");
                            } else if (item.category === "task") {
                              const proj = projects.find(
                                (p) =>
                                  String(p.id) ===
                                  String(item.taskObj.project_id)
                              );
                              if (proj) setSelectedProject(proj);
                              setActivePage("Production");
                            } else if (item.category === "lead") {
                              setActivePage("Leads");
                            }
                          }}
                        >
                          View &rarr;
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <section className="panel calendar-panel">
                <div className="panel-header">
                  <div>
                    <p className="eyebrow">THIS WEEK</p>
                    <h2>Next 7 Days ({thisWeekItems.length})</h2>
                  </div>
                </div>

                {thisWeekItems.length === 0 ? (
                  <p className="calendar-empty-sub">
                    No deadlines or tasks scheduled for the next 7 days.
                  </p>
                ) : (
                  <div className="agenda-list">
                    {thisWeekItems.map((item) => (
                      <div className="agenda-card" key={item.id}>
                        <div className="agenda-date-badge">
                          <span className="agenda-date-label">DATE</span>
                          <strong>{item.date}</strong>
                        </div>

                        <div className="agenda-info">
                          <div className="agenda-title-row">
                            <span className="agenda-type-badge">
                              {item.type}
                            </span>
                            <h3>{item.title}</h3>
                          </div>
                          <p className="agenda-detail">{item.detail}</p>
                          <span className="agenda-meta">{item.meta}</span>
                        </div>

                        <button
                          className="small-button agenda-jump-button"
                          onClick={() => {
                            if (item.category === "deadline") {
                              setSelectedProject(item.projectObj);
                              setActivePage("Projects");
                            } else if (item.category === "task") {
                              const proj = projects.find(
                                (p) =>
                                  String(p.id) ===
                                  String(item.taskObj.project_id)
                              );
                              if (proj) setSelectedProject(proj);
                              setActivePage("Production");
                            } else if (item.category === "lead") {
                              setActivePage("Leads");
                            }
                          }}
                        >
                          View &rarr;
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="panel calendar-panel">
                <div className="panel-header">
                  <div>
                    <p className="eyebrow">LATER</p>
                    <h2>Upcoming ({upcomingItems.length})</h2>
                  </div>
                </div>

                {upcomingItems.length === 0 ? (
                  <p className="calendar-empty-sub">
                    No future scheduled dates found.
                  </p>
                ) : (
                  <div className="agenda-list">
                    {upcomingItems.map((item) => (
                      <div className="agenda-card" key={item.id}>
                        <div className="agenda-date-badge">
                          <span className="agenda-date-label">DATE</span>
                          <strong>{item.date}</strong>
                        </div>

                        <div className="agenda-info">
                          <div className="agenda-title-row">
                            <span className="agenda-type-badge">
                              {item.type}
                            </span>
                            <h3>{item.title}</h3>
                          </div>
                          <p className="agenda-detail">{item.detail}</p>
                          <span className="agenda-meta">{item.meta}</span>
                        </div>

                        <button
                          className="small-button agenda-jump-button"
                          onClick={() => {
                            if (item.category === "deadline") {
                              setSelectedProject(item.projectObj);
                              setActivePage("Projects");
                            } else if (item.category === "task") {
                              const proj = projects.find(
                                (p) =>
                                  String(p.id) ===
                                  String(item.taskObj.project_id)
                              );
                              if (proj) setSelectedProject(proj);
                              setActivePage("Production");
                            } else if (item.category === "lead") {
                              setActivePage("Leads");
                            }
                          }}
                        >
                          View &rarr;
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </>
        )}
      </main>

      <nav className="mobile-bottom-nav">
        {[
          { id: "Dashboard", label: "Home", icon: "⊞" },
          { id: "Leads", label: "Leads", icon: "👥" },
          { id: "Clients", label: "Clients", icon: "🏢" },
          { id: "Projects", label: "Projects", icon: "📁" },
          { id: "Production", label: "Production", icon: "🎬" },
          { id: "Finance", label: "Finance", icon: "💰" },
          { id: "Calendar", label: "Calendar", icon: "📅" },
        ].map((item) => (
          <button
            key={item.id}
            className={`mobile-nav-item ${
              activePage === item.id ? "active" : ""
            }`}
            onClick={() => {
              setActivePage(item.id);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            <span className="mobile-nav-icon">{item.icon}</span>
            <span className="mobile-nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      {showLeadModal && (
        <div
          className="modal-overlay"
          onMouseDown={(e) => {
            if (
              e.target ===
              e.currentTarget
            ) {
              closeLeadModal();
            }
          }}
        >
          <div className="modal">
            <div className="modal-header">
              <div>
                <p className="eyebrow">
                  {editingLead
                    ? "EDIT LEAD"
                    : "NEW PROSPECT"}
                </p>

                <h2>
                  {editingLead
                    ? "Edit Lead"
                    : "Add Lead"}
                </h2>
              </div>

              <button
                className="close-button"
                onClick={
                  closeLeadModal
                }
                type="button"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={
                saveLead
              }
            >
              <label>
                Company Name *

                <input
                  value={
                    leadForm.company
                  }
                  onChange={(e) =>
                    setLeadForm({
                      ...leadForm,
                      company:
                        e.target
                          .value,
                    })
                  }
                  placeholder="e.g. Himalayan Resort"
                  required
                />
              </label>

              <label>
                Contact Person

                <input
                  value={
                    leadForm.contact
                  }
                  onChange={(e) =>
                    setLeadForm({
                      ...leadForm,
                      contact:
                        e.target
                          .value,
                    })
                  }
                  placeholder="Decision maker"
                />
              </label>

              <label>
                Phone

                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength="10"
                  value={
                    leadForm.phone
                  }
                  onChange={(e) =>
                    setLeadForm({
                      ...leadForm,
                      phone: e.target.value.replace(
                        /\D/g,
                        ""
                      ),
                    })
                  }
                  placeholder="98XXXXXXXX"
                />
              </label>

              <div className="form-grid">
                <label>
                  Industry

                  <select
                    value={
                      leadForm.industry
                    }
                    onChange={(e) =>
                      setLeadForm({
                        ...leadForm,
                        industry:
                          e.target
                            .value,
                      })
                    }
                  >
                    {INDUSTRIES.map(
                      (
                        industry
                      ) => (
                        <option
                          key={
                            industry
                          }
                        >
                          {
                            industry
                          }
                        </option>
                      )
                    )}
                  </select>
                </label>

                <label>
                  Potential Value

                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={
                      leadForm.value
                    }
                    onWheel={(e) =>
                      e.currentTarget.blur()
                    }
                    onChange={(e) => {
                      const value =
                        e.target
                          .value;

                      if (
                        value ===
                          "" ||
                        /^\d+$/.test(
                          value
                        )
                      ) {
                        setLeadForm({
                          ...leadForm,
                          value,
                        });
                      }
                    }}
                  />
                </label>
              </div>

              <div className="form-grid">
                <label>
                  Status

                  <select
                    value={
                      leadForm.status
                    }
                    onChange={(e) =>
                      updateLeadStatus(
                        e.target
                          .value
                      )
                    }
                  >
                    {LEAD_STATUSES.map(
                      (
                        status
                      ) => (
                        <option
                          key={
                            status
                          }
                        >
                          {
                            status
                          }
                        </option>
                      )
                    )}
                  </select>
                </label>

                {![
                  "Won",
                  "Lost",
                ].includes(
                  leadForm.status
                ) && (
                  <label>
                    Next Follow-up

                    <input
                      type="date"
                      min={
                        new Date()
                          .toISOString()
                          .slice(
                            0,
                            10
                          )
                      }
                      value={
                        leadForm.followUp
                      }
                      onChange={(e) =>
                        setLeadForm({
                          ...leadForm,
                          followUp:
                            e.target
                              .value,
                        })
                      }
                      required
                    />
                  </label>
                )}
              </div>

              {leadForm.status ===
                "Lost" && (
                <label>
                  Lost Reason

                  <select
                    value={
                      leadForm.lostReason
                    }
                    onChange={(e) =>
                      setLeadForm({
                        ...leadForm,
                        lostReason:
                          e.target
                            .value,
                      })
                    }
                    required
                  >
                    <option value="">
                      Select a
                      reason
                    </option>

                    <option value="Price">
                      Price
                    </option>

                    <option value="Competitor">
                      Chose
                      competitor
                    </option>

                    <option value="No response">
                      No response
                    </option>

                    <option value="Not interested">
                      Not interested
                    </option>

                    <option value="No budget">
                      No budget
                    </option>

                    <option value="Other">
                      Other
                    </option>
                  </select>
                </label>
              )}

              <label>
                Notes

                <textarea
                  value={
                    leadForm.notes
                  }
                  onChange={(e) =>
                    setLeadForm({
                      ...leadForm,
                      notes:
                        e.target
                          .value,
                    })
                  }
                  placeholder="What do we know about this prospect?"
                  rows="4"
                />
              </label>

              {error && (
                <div className="form-error">
                  {error}
                </div>
              )}

              <button
                className="submit-button"
                type="submit"
                disabled={
                  saving
                }
              >
                {getLeadButtonText()}
              </button>
            </form>
          </div>
        </div>
      )}

      {showClientModal && (
        <div
          className="modal-overlay"
          onMouseDown={(e) => {
            if (
              e.target ===
              e.currentTarget
            ) {
              closeClientModal();
            }
          }}
        >
          <div className="modal">
            <div className="modal-header">
              <div>
                <p className="eyebrow">
                  NEW CLIENT
                </p>

                <h2>
                  Add Client
                </h2>
              </div>

              <button
                className="close-button"
                onClick={
                  closeClientModal
                }
                type="button"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={
                saveClient
              }
            >
              <label>
                Company Name *

                <input
                  value={
                    clientForm.company
                  }
                  onChange={(e) =>
                    setClientForm({
                      ...clientForm,
                      company:
                        e.target
                          .value,
                    })
                  }
                  placeholder="e.g. Himalayan Resort"
                  required
                />
              </label>

              <label>
                Contact Person

                <input
                  value={
                    clientForm.contact
                  }
                  onChange={(e) =>
                    setClientForm({
                      ...clientForm,
                      contact:
                        e.target
                          .value,
                    })
                  }
                  placeholder="Decision maker"
                />
              </label>

              <label>
                Phone

                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength="10"
                  value={
                    clientForm.phone
                  }
                  onChange={(e) =>
                    setClientForm({
                      ...clientForm,
                      phone: e.target.value.replace(
                        /\D/g,
                        ""
                      ),
                    })
                  }
                  placeholder="98XXXXXXXX"
                />
              </label>

              <div className="form-grid">
                <label>
                  Industry

                  <select
                    value={
                      clientForm.industry
                    }
                    onChange={(e) =>
                      setClientForm({
                        ...clientForm,
                        industry:
                          e.target
                            .value,
                      })
                    }
                  >
                    {INDUSTRIES.map(
                      (
                        industry
                      ) => (
                        <option
                          key={
                            industry
                          }
                        >
                          {
                            industry
                          }
                        </option>
                      )
                    )}
                  </select>
                </label>

                <label>
                  Monthly Value

                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={
                      clientForm.monthlyValue
                    }
                    onWheel={(e) =>
                      e.currentTarget.blur()
                    }
                    onChange={(e) => {
                      const value =
                        e.target
                          .value;

                      if (
                        value ===
                          "" ||
                        /^\d+$/.test(
                          value
                        )
                      ) {
                        setClientForm({
                          ...clientForm,
                          monthlyValue:
                            value,
                        });
                      }
                    }}
                  />
                </label>
              </div>

              <div className="form-grid">
                <label>
                  Contract Start

                  <input
                    type="date"
                    value={
                      clientForm.contractStart
                    }
                    onChange={(e) =>
                      setClientForm({
                        ...clientForm,
                        contractStart:
                          e.target
                            .value,
                      })
                    }
                  />
                </label>

                <label>
                  Contract End

                  <input
                    type="date"
                    min={
                      clientForm.contractStart ||
                      undefined
                    }
                    value={
                      clientForm.contractEnd
                    }
                    onChange={(e) =>
                      setClientForm({
                        ...clientForm,
                        contractEnd:
                          e.target
                            .value,
                      })
                    }
                  />
                </label>
              </div>

              <div className="form-grid">
                <label>
                  Payment Status

                  <select
                    value={
                      clientForm.paymentStatus
                    }
                    onChange={(e) =>
                      setClientForm({
                        ...clientForm,
                        paymentStatus:
                          e.target
                            .value,
                      })
                    }
                  >
                    <option>
                      Pending
                    </option>

                    <option>
                      Paid
                    </option>

                    <option>
                      Partial
                    </option>

                    <option>
                      Overdue
                    </option>
                  </select>
                </label>

                <label>
                  Client Status

                  <select
                    value={
                      clientForm.status
                    }
                    onChange={(e) =>
                      setClientForm({
                        ...clientForm,
                        status:
                          e.target
                            .value,
                      })
                    }
                  >
                    <option>
                      Active
                    </option>

                    <option>
                      Inactive
                    </option>
                  </select>
                </label>
              </div>

              <label>
                Notes

                <textarea
                  value={
                    clientForm.notes
                  }
                  onChange={(e) =>
                    setClientForm({
                      ...clientForm,
                      notes:
                        e.target
                          .value,
                    })
                  }
                  placeholder="Important information about this client"
                  rows="4"
                />
              </label>

              {error && (
                <div className="form-error">
                  {error}
                </div>
              )}

              <button
                className="submit-button"
                type="submit"
                disabled={
                  saving
                }
              >
                {saving
                  ? "Saving..."
                  : "Create Client"}
              </button>
            </form>
          </div>
        </div>
      )}

      {showProjectModal && (
        <div
          className="modal-overlay"
          onMouseDown={(e) => {
            if (
              e.target ===
              e.currentTarget
            ) {
              closeProjectModal();
            }
          }}
        >
          <div className="modal">
            <div className="modal-header">
              <div>
                <p className="eyebrow">
                  {editingProject
                    ? "EDIT PROJECT"
                    : "NEW PROJECT"}
                </p>

                <h2>
                  {editingProject
                    ? "Edit Project"
                    : "Create Project"}
                </h2>
              </div>

              <button
                className="close-button"
                onClick={
                  closeProjectModal
                }
                type="button"
              >
                ×
              </button>
            </div>

            {clients.length ===
            0 ? (
              <div className="empty-state">
                <strong>
                  No clients
                  available.
                </strong>

                <p>
                  Create a client
                  before creating
                  a project.
                </p>
              </div>
            ) : (
              <form
                onSubmit={
                  saveProject
                }
              >
                <label>
                  Client *

                  <select
                    value={
                      projectForm.clientId
                    }
                    onChange={(e) =>
                      setProjectForm({
                        ...projectForm,
                        clientId:
                          e.target
                            .value,
                      })
                    }
                    required
                  >
                    <option value="">
                      Select a
                      client
                    </option>

                    {clients.map(
                      (
                        client
                      ) => (
                        <option
                          key={
                            client.id
                          }
                          value={
                            client.id
                          }
                        >
                          {
                            client.company
                          }
                        </option>
                      )
                    )}
                  </select>
                </label>

                <label>
                  Project Name *

                  <input
                    value={
                      projectForm.name
                    }
                    onChange={(e) =>
                      setProjectForm({
                        ...projectForm,
                        name:
                          e.target
                            .value,
                      })
                    }
                    placeholder="e.g. Himalayan Resort Brand Film"
                    required
                  />
                </label>

                <div className="form-grid">
                  <label>
                    Project Type

                    <select
                      value={
                        projectForm.projectType
                      }
                      onChange={(e) =>
                        setProjectForm({
                          ...projectForm,
                          projectType:
                            e.target
                              .value,
                        })
                      }
                    >
                      {PROJECT_TYPES.map(
                        (
                          type
                        ) => (
                          <option
                            key={
                              type
                            }
                          >
                            {
                              type
                            }
                          </option>
                        )
                      )}
                    </select>
                  </label>

                  <label>
                    Status

                    <select
                      value={
                        projectForm.status
                      }
                      onChange={(e) =>
                        setProjectForm({
                          ...projectForm,
                          status:
                            e.target
                              .value,
                        })
                      }
                    >
                      {PROJECT_STATUSES.map(
                        (
                          status
                        ) => (
                          <option
                            key={
                              status
                            }
                          >
                            {
                              status
                            }
                          </option>
                        )
                      )}
                    </select>
                  </label>
                </div>

                <div className="form-grid">
                  <label>
                    Start Date

                    <input
                      type="date"
                      value={
                        projectForm.startDate
                      }
                      onChange={(e) =>
                        setProjectForm({
                          ...projectForm,
                          startDate:
                            e.target
                              .value,
                        })
                      }
                    />
                  </label>

                  <label>
                    Deadline

                    <input
                      type="date"
                      min={
                        projectForm.startDate ||
                        undefined
                      }
                      value={
                        projectForm.deadline
                      }
                      onChange={(e) =>
                        setProjectForm({
                          ...projectForm,
                          deadline:
                            e.target
                              .value,
                        })
                      }
                    />
                  </label>
                </div>

                <div className="form-grid">
                  <label>
                    Project Budget

                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={
                        projectForm.budget
                      }
                      onWheel={(e) =>
                        e.currentTarget.blur()
                      }
                      onChange={(e) => {
                        const value =
                          e.target
                            .value;

                        if (
                          value ===
                            "" ||
                          /^\d+$/.test(
                            value
                          )
                        ) {
                          setProjectForm({
                            ...projectForm,
                            budget:
                              value,
                          });
                        }
                      }}
                    />
                  </label>

                  <label>
                    Payment Status

                    <select
                      value={
                        projectForm.paymentStatus
                      }
                      onChange={(e) =>
                        setProjectForm({
                          ...projectForm,
                          paymentStatus:
                            e.target
                              .value,
                        })
                      }
                    >
                      {PAYMENT_STATUSES.map(
                        (
                          status
                        ) => (
                          <option
                            key={
                              status
                            }
                          >
                            {
                              status
                            }
                          </option>
                        )
                      )}
                    </select>
                  </label>
                </div>

                <label>
                  Description

                  <textarea
                    value={
                      projectForm.description
                    }
                    onChange={(e) =>
                      setProjectForm({
                        ...projectForm,
                        description:
                          e.target
                            .value,
                      })
                    }
                    placeholder="What is Aura Films producing for this client?"
                    rows="4"
                  />
                </label>

                <label>
                  Internal Notes

                  <textarea
                    value={
                      projectForm.notes
                    }
                    onChange={(e) =>
                      setProjectForm({
                        ...projectForm,
                        notes:
                          e.target
                            .value,
                      })
                    }
                    placeholder="Internal production notes"
                    rows="3"
                  />
                </label>

                {error && (
                  <div className="form-error">
                    {error}
                  </div>
                )}

                <button
                  className="submit-button"
                  type="submit"
                  disabled={
                    saving
                  }
                >
                  {saving
                    ? "Saving..."
                    : editingProject
                    ? "Save Changes"
                    : "Create Project"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {showTaskModal && (
        <div
          className="modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closeTaskModal();
            }
          }}
        >
          <div className="modal">
            <div className="modal-header">
              <div>
                <p className="eyebrow">
                  {editingTask ? "EDIT TASK" : "NEW TASK"}
                </p>
                <h2>
                  {editingTask ? "Edit Production Task" : "Create Production Task"}
                </h2>
              </div>

              <button
                className="close-button"
                onClick={closeTaskModal}
                type="button"
              >
                ×
              </button>
            </div>

            <form onSubmit={saveProjectTask}>
              <label>
                Project *
                <select
                  value={taskForm.projectId}
                  onChange={(e) =>
                    setTaskForm({
                      ...taskForm,
                      projectId: e.target.value,
                    })
                  }
                >
                  <option value="">Select a project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Task Title *
                <input
                  value={taskForm.title}
                  onChange={(e) =>
                    setTaskForm({
                      ...taskForm,
                      title: e.target.value,
                    })
                  }
                  placeholder="e.g. Create the shot list"
                />
              </label>

              <div className="form-grid">
                <label>
                  Stage
                  <select
                    value={taskForm.stage}
                    onChange={(e) =>
                      setTaskForm({
                        ...taskForm,
                        stage: e.target.value,
                      })
                    }
                  >
                    {TASK_STAGES.map((stage) => (
                      <option key={stage} value={stage}>
                        {stage}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Status
                  <select
                    value={taskForm.status}
                    onChange={(e) =>
                      setTaskForm({
                        ...taskForm,
                        status: e.target.value,
                      })
                    }
                  >
                    {TASK_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="form-grid">
                <label>
                  Assigned To
                  <input
                    value={taskForm.assignedTo}
                    onChange={(e) =>
                      setTaskForm({
                        ...taskForm,
                        assignedTo: e.target.value,
                      })
                    }
                    placeholder="Name or role"
                  />
                </label>

                <label>
                  Due Date
                  <input
                    type="date"
                    value={taskForm.dueDate}
                    onChange={(e) =>
                      setTaskForm({
                        ...taskForm,
                        dueDate: e.target.value,
                      })
                    }
                  />
                </label>
              </div>

              <label>
                Notes
                <textarea
                  rows="3"
                  value={taskForm.notes}
                  onChange={(e) =>
                    setTaskForm({
                      ...taskForm,
                      notes: e.target.value,
                    })
                  }
                  placeholder="Anything the production team needs to know"
                />
              </label>

              {error && <div className="form-error">{error}</div>}

              <button
                className="submit-button"
                type="submit"
                disabled={savingTask}
              >
                {savingTask
                  ? "Saving..."
                  : editingTask
                  ? "Save Changes"
                  : "Create Task"}
              </button>
            </form>
          </div>
        </div>
      )}

      {showPaymentModal && (
        <div
          className="modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closePaymentModal();
            }
          }}
        >
          <div className="modal">
            <div className="modal-header">
              <div>
                <p className="eyebrow">
                  {editingPayment ? "EDIT PAYMENT" : "RECORD PAYMENT"}
                </p>
                <h2>
                  {editingPayment
                    ? "Edit Payment Record"
                    : "Record Project Payment"}
                </h2>
              </div>

              <button
                className="close-button"
                onClick={closePaymentModal}
                type="button"
              >
                ×
              </button>
            </div>

            <form onSubmit={saveProjectPayment}>
              <label>
                Project *
                <select
                  value={paymentForm.projectId}
                  onChange={(e) =>
                    setPaymentForm({
                      ...paymentForm,
                      projectId: e.target.value,
                    })
                  }
                  required
                >
                  <option value="">Select a project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name} ({getClientName(project.client_id)})
                    </option>
                  ))}
                </select>
              </label>

              <div className="form-grid">
                <label>
                  Amount (NPR) *
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={paymentForm.amount}
                    onChange={(e) =>
                      setPaymentForm({
                        ...paymentForm,
                        amount: e.target.value,
                      })
                    }
                    placeholder="e.g. 50000"
                    required
                  />
                </label>

                <label>
                  Status *
                  <select
                    value={paymentForm.status}
                    onChange={(e) =>
                      setPaymentForm({
                        ...paymentForm,
                        status: e.target.value,
                      })
                    }
                  >
                    {PAYMENT_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label>
                Payment Date
                <input
                  type="date"
                  value={paymentForm.paymentDate}
                  onChange={(e) =>
                    setPaymentForm({
                      ...paymentForm,
                      paymentDate: e.target.value,
                    })
                  }
                />
              </label>

              <label>
                Notes / Reference
                <textarea
                  rows="3"
                  value={paymentForm.notes}
                  onChange={(e) =>
                    setPaymentForm({
                      ...paymentForm,
                      notes: e.target.value,
                    })
                  }
                  placeholder="Transfer reference, cheque #, advance/milestone notes"
                />
              </label>

              {error && <div className="form-error">{error}</div>}

              <button
                className="submit-button"
                type="submit"
                disabled={savingPayment}
              >
                {savingPayment
                  ? "Saving..."
                  : editingPayment
                  ? "Save Changes"
                  : "Record Payment"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
