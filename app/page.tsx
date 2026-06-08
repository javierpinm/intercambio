"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "motion/react";
import {
  CheckCircle2,
  AlertTriangle,
  Search,
  Menu,
  X,
  Bell,
  Sun,
  Moon,
  Plus,
  MapPin,
  User,
  Check,
  LogOut,
  Coins,
  MessageSquare,
  Calendar,
  TrendingUp,
  Info,
  Award,
  Edit2,
  Trash,
  ChevronRight,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Map as MapIcon,
  Layers,
  HeartHandshake
} from "lucide-react";

import {
  dataService,
  UserProfile,
  Post,
  Exchange,
  AppNotification,
  NEIGHBORHOOD_COORDS
} from "../lib/dataService";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  
  // Navigation & UI States
  const [activeTab, setActiveTab] = useState<"explorar" | "favores" | "mapa" | "perfil">("explorar");
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [theme, setTheme] = useState<"light" | "dark" >("light");
  
  // Lists & Feeds (synchronized with mock localStorage repository) initialized via lazy loaders
  const [posts, setPosts] = useState<Post[]>([]);
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  
  const refreshData = () => {
    setPosts(dataService.getPosts());
    setExchanges(dataService.getExchanges());
    setNotifications(dataService.getUserNotifications());
  };
  
  // Search & Filtering States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("todos");
  const [selectedFilter, setSelectedFilter] = useState<"todos" | "urgente" | "nuevos" | "cercano">("todos");
  
  // Create Post Modal State
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [newPostType, setNewPostType] = useState<"ofrezco" | "necesito">("necesito");
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostCategory, setNewPostCategory] = useState<Post["category"]>("reparaciones");
  const [newPostPoints, setNewPostPoints] = useState<number>(3);
  const [newPostUrgent, setNewPostUrgent] = useState(false);
  const [newPostLocation, setNewPostLocation] = useState("Chamberí");
  const [newPostDescription, setNewPostDescription] = useState("");
  const [postFormError, setPostFormError] = useState("");

  // Edit Profile States
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedBio, setEditedBio] = useState("");
  const [editedLocation, setEditedLocation] = useState("Chamberí");
  const [newSkillText, setNewSkillText] = useState("");
  const [profileSkills, setProfileSkills] = useState<string[]>([]);
  
  // Active Card Filter on "Mis Favores" tab (triggered by Status Cards)
  const [exchangeFilterRole, setExchangeFilterRole] = useState<"todos" | "te_deben" | "debes" >("todos");

  // Notifications Popover State
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Selected Post Details Dialog
  const [selectedPostDetail, setSelectedPostDetail] = useState<Post | null>(null);
  const [showExchangeSuccessModal, setShowExchangeSuccessModal] = useState("");

  // Destructive Actions Modals
  const [cancelExchangePromptId, setCancelExchangePromptId] = useState<string | null>(null);
  const [logoutPrompt, setLogoutPrompt] = useState(false);

  // Selected Map Neighborhood for Interactive SVG Map
  const [selectedMapNeighborhood, setSelectedMapNeighborhood] = useState<string | null>(null);

  // Load Initial Settings
  useEffect(() => {
    // 1. Initialise mock data collections on client
    dataService.init();
    
    // 2. Load and set state on client on next tick to prevent synchronous effect warnings
    setTimeout(() => {
      const user = dataService.getCurrentUser();
      if (user) {
        setCurrentUser(user);
        setEditedName(user.name);
        setEditedBio(user.bio);
        setEditedLocation(user.locationLabel);
        setProfileSkills(user.skills);
      }
      
      setTheme(dataService.getStoredTheme());
      setPosts(dataService.getPosts());
      setExchanges(dataService.getExchanges());
      setNotifications(dataService.getUserNotifications());
      setMounted(true);
    }, 0);
    
    // 3. Load theme preference
    const savedTheme = dataService.getStoredTheme();
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // 4. Register service worker if available (PWA bonus)
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js")
        .then(() => {})
        .catch(() => {});
    }
  }, []);

  // Helper theme toggle
  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    dataService.setStoredTheme(nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleGoogleLogin = () => {
    const user = dataService.loginAsGoogleMock();
    if (user) {
      setCurrentUser(user);
      setEditedName(user.name);
      setEditedBio(user.bio);
      setEditedLocation(user.locationLabel);
      setProfileSkills(user.skills);
      refreshData();
    }
  };

  const handleGuestLogin = () => {
    const user = dataService.loginAsGuest();
    if (user) {
      setCurrentUser(user);
      setEditedName(user.name);
      setEditedBio(user.bio);
      setEditedLocation(user.locationLabel);
      setProfileSkills(user.skills);
      refreshData();
    }
  };

  const handleLogOut = () => {
    dataService.logOut();
    setCurrentUser(null);
    setLogoutPrompt(false);
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editedName.trim()) return;

    const updated = dataService.updateUserProfile({
      name: editedName,
      bio: editedBio,
      locationLabel: editedLocation,
      skills: profileSkills
    });

    if (updated) {
      setCurrentUser(updated);
      setIsEditingProfile(false);
      refreshData();
    }
  };

  const handleAddSkill = () => {
    if (!newSkillText.trim()) return;
    if (profileSkills.includes(newSkillText.trim())) {
      setNewSkillText("");
      return;
    }
    setProfileSkills([...profileSkills, newSkillText.trim()]);
    setNewSkillText("");
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setProfileSkills(profileSkills.filter(s => s !== skillToRemove));
  };

  const handleCreatePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPostFormError("");

    if (!newPostTitle.trim()) {
      setPostFormError("El título no puede estar vacío");
      return;
    }
    if (!newPostDescription.trim()) {
      setPostFormError("Por favor, escribe una descripción detallada");
      return;
    }
    if (newPostPoints <= 0) {
      setPostFormError("Los puntos deben ser un valor positivo");
      return;
    }

    const created = dataService.createPost({
      type: newPostType,
      title: newPostTitle,
      description: newPostDescription,
      category: newPostCategory,
      suggestedPoints: Math.floor(newPostPoints),
      isUrgent: newPostUrgent,
      locationLabel: newPostLocation
    });

    if (created) {
      setIsPostModalOpen(false);
      // Clean form
      setNewPostTitle("");
      setNewPostPoints(3);
      setNewPostUrgent(false);
      setNewPostDescription("");
      
      // Update data
      refreshData();
    }
  };

  // State Machine interactions
  const handleInitiateExchange = (postId: string) => {
    if (!currentUser) {
      alert("Por favor, inicia sesión para proponer un intercambio.");
      return;
    }

    const exchange = dataService.initiateExchange(postId);
    if (exchange) {
      setSelectedPostDetail(null);
      setShowExchangeSuccessModal(`¡Propuesta enviada! Has solicitado el intercambio para "${exchange.postTitle}".`);
      setActiveTab("favores");
      refreshData();
    } else {
      alert("No se ha podido iniciar el intercambio. Puede que ya sea tuyo o que esté en proceso.");
    }
  };

  const handleAcceptExchange = (id: string) => {
    const updated = dataService.acceptExchange(id);
    if (updated) {
      setShowExchangeSuccessModal(`¡Propuesta aceptada! El intercambio de "${updated.postTitle}" está ahora en progreso.`);
      refreshData();
    } else {
      alert("No se ha podido aceptar el intercambio. Puede que no seas el autor de esta publicación.");
    }
  };

  const handleCompleteExchange = (id: string) => {
    const updated = dataService.completeExchange(id);
    if (updated) {
      if (updated.requesterConfirmedComplete && updated.helperConfirmedComplete) {
        setShowExchangeSuccessModal(`¡Transacción completada! Los ${updated.points} puntos se han transferido.`);
      } else {
        setShowExchangeSuccessModal(`¡Has confirmado tu parte! Esperando confirmación del vecino.`);
      }
      refreshData();
    }
  };

  const handleCancelExchange = (id: string) => {
    dataService.cancelExchange(id);
    setCancelExchangePromptId(null);
    refreshData();
  };

  const handleMarkNotifsRead = () => {
    dataService.markNotificationsAsRead();
    refreshData();
  };

  // Filter & Search Logic
  const filteredPosts = posts.filter(post => {
    const matchesSearch = 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      post.category.toLowerCase().includes(searchQuery.toLowerCase()) || 
      post.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === "todos" || post.category === selectedCategory;
    
    let matchesFilter = true;
    if (selectedFilter === "urgente") {
      matchesFilter = post.isUrgent;
    }
    
    return matchesSearch && matchesCategory && matchesFilter;
  });

  // Apply sorting based on "Más cercano" or "Nuevos"
  const displayedPosts = [...filteredPosts].sort((a, b) => {
    if (selectedFilter === "nuevos") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (selectedFilter === "cercano" && currentUser) {
      // Show user's neighborhood first
      const aOwn = a.locationLabel === currentUser.locationLabel ? 1 : 0;
      const bOwn = b.locationLabel === currentUser.locationLabel ? 1 : 0;
      return bOwn - aOwn;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Count active stats for Dashboard Cards
  const countTeDebenFavores = () => {
    if (!currentUser) return 0;
    // Count of exchanges where currentUser helped (helperId === user.id) and awaits confirmation of completion
    // status is en_progreso or pendiente
    return exchanges.filter(e => 
      e.helperId === currentUser.id && 
      e.status === "en_progreso" && 
      !e.requesterConfirmedComplete
    ).length;
  };

  const getUrgentObligation = () => {
    if (!currentUser) return null;
    // Obligation means currentUser is helper (helperId === user.id) and exchange is active en_progreso
    const myObligations = exchanges.filter(e => 
      e.helperId === currentUser.id && 
      e.status === "en_progreso"
    );
    if (myObligations.length === 0) return null;
    
    // Sort so requesterConfirmedComplete = true is lower priority because helper didn't acknowledge yet? 
    // Just return the oldest/most pending active one
    return myObligations[0];
  };

  const urgentObligation = getUrgentObligation();

  // Category tags styles map
  const getCategoryTheme = (cat: string) => {
    const mapping: Record<string, { label: string; color: string; bg: string }> = {
      reparaciones: { label: "🛠️ Reparaciones", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/40" },
      jardin: { label: "🌱 Jardinería", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/40" },
      tecnologia: { label: "💻 Tecnología", color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-950/40" },
      mascotas: { label: "🐾 Mascotas", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/40" },
      mudanzas: { label: "📦 Mudanzas", color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-950/40" },
      arte: { label: "🎨 Arte y Ocio", color: "text-pink-600 dark:text-pink-400", bg: "bg-pink-50 dark:bg-pink-950/40" },
      otro: { label: "🤝 Otros", color: "text-slate-600 dark:text-slate-400", bg: "bg-slate-100 dark:bg-slate-800" },
    };
    return mapping[cat] || { label: cat, color: "text-gray-600", bg: "bg-gray-100" };
  };

  const countUnreadNotifications = () => {
    return notifications.filter(n => !n.read).length;
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F7F9FC] dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans">
      
      {/* HEADER SECTION */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur border-b border-slate-200/60 dark:border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          
          {/* Logo with Spanish Branding */}
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setActiveTab("explorar")}>
            <div className="bg-[#FF6B35] text-white p-2.5 rounded-xl shadow-lg shadow-orange-200/50 dark:shadow-none">
              <HeartHandshake className="h-6 w-6" id="logo-icon" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-[#011627] dark:text-white">
                Intercambio
              </span>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono tracking-wider uppercase -mt-1 hidden sm:block">
                La Red del Barrio
              </p>
            </div>
          </div>

          {/* User Status / Auth / Actions */}
          <div className="flex items-center space-x-3">
            {currentUser ? (
              <>
                {/* Dynamic Gold Points Coin Counter */}
                <div 
                  className="flex items-center space-x-1.5 bg-[#FF6B35]/10 border border-[#FF6B35]/20 px-3 py-1.5 rounded-full cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => setActiveTab("perfil")}
                  title="Tus puntos disponibles para intercambiar"
                >
                  <Coins className="h-4.5 w-4.5 text-[#FF6B35] animate-pulse" />
                  <span className="font-bold text-[#FF6B35] text-sm">
                    {currentUser.points} pts
                  </span>
                </div>

                {/* Notifications Bell Dropdown */}
                <div className="relative">
                  <button 
                    onClick={() => {
                      setIsNotifOpen(!isNotifOpen);
                      if (!isNotifOpen) handleMarkNotifsRead();
                    }}
                    className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors relative"
                    id="notif-bell"
                  >
                    <Bell className="h-5 w-5" />
                    {countUnreadNotifications() > 0 && (
                      <span className="absolute top-1 right-1 h-4 w-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                        {countUnreadNotifications()}
                      </span>
                    )}
                  </button>

                  <AnimatePresence>
                    {isNotifOpen && (
                      <>
                        {/* Overlay to dismiss */}
                        <div className="fixed inset-0 z-40" onClick={() => setIsNotifOpen(false)} />
                        
                        <motion.div 
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden"
                        >
                          <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                            <span className="font-semibold text-sm">Notificaciones</span>
                            <button 
                              className="text-xs text-[#FF6B35] font-bold hover:underline"
                              onClick={() => {
                                dataService.setNotifications([]);
                                refreshData();
                              }}
                            >
                              Limpiar todas
                            </button>
                          </div>
                          <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-900">
                            {notifications.length === 0 ? (
                              <div className="p-4 text-center text-xs text-slate-500">
                                No tienes avisos nuevos
                              </div>
                            ) : (
                              notifications.map((notif) => (
                                <div 
                                  key={notif.id}
                                  className="p-3 hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors text-xs"
                                  onClick={() => {
                                    setIsNotifOpen(false);
                                    setActiveTab("favores");
                                  }}
                                >
                                  <div className="flex items-start justify-between">
                                    <span className="font-medium text-slate-800 dark:text-slate-200">
                                      {notif.title}
                                    </span>
                                    <span className="text-[10px] text-slate-400">
                                      {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>
                                  <p className="text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                                    {notif.message}
                                  </p>
                                </div>
                              ))
                            )}
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>

                {/* Profile Widget */}
                <div 
                  className="flex items-center space-x-2 cursor-pointer p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full pr-3 transition-colors"
                  onClick={() => setActiveTab("perfil")}
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-[#FF6B35] to-[#FF9F1C] text-white flex items-center justify-center font-bold text-sm shadow-inner">
                    {currentUser.avatar.length <= 2 ? currentUser.avatar : "👥"}
                  </div>
                  <span className="text-xs font-semibold hidden md:block max-w-[100px] truncate">
                    {currentUser.name.split(" ")[0]}
                  </span>
                </div>

                {/* Logout Button */}
                <button 
                  onClick={() => setLogoutPrompt(true)}
                  className="p-2 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-full transition-colors"
                  title="Cerrar sesión"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <button 
                  onClick={handleGuestLogin}
                  className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:underline px-3 py-1.5"
                >
                  Modo invitado
                </button>
                <button 
                  onClick={handleGoogleLogin}
                  className="bg-[#FF6B35] hover:bg-[#FF6B35]/95 text-white text-xs font-bold px-4 py-2 rounded-full shadow-md transition-all"
                >
                  Continuar
                </button>
              </div>
            )}

            {/* Dark Mode Icon Button */}
            <button 
              onClick={toggleTheme}
              className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-full transition-colors"
              title="Alternar tono"
            >
              {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>

          </div>
        </div>
      </header>

      {/* CORE WRAPPER */}
      <main className="max-w-7xl mx-auto px-4 py-6 pb-24">
        
        {/* WELCOME BANNER FOR NON-AUTHENTICATED */}
        {!currentUser && (
          <div className="bg-gradient-to-br from-[#011627] to-[#011627]/90 text-white rounded-[2rem] p-6 sm:p-10 shadow-2xl relative overflow-hidden mb-8">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF6B35]/15 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-[#FF9F1C]/15 rounded-full blur-3xl" />
            
            <div className="max-w-2xl relative z-10 space-y-4">
              <div className="inline-flex items-center space-x-1.5 bg-[#FF6B35]/20 border border-[#FF6B35]/30 px-3 py-1 rounded-full text-xs text-[#FF6B35] font-semibold">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Intercambio vecinal solidario y limpio</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                Intercambia favores con tus vecinos. Sin dinero. Con seguridad.
              </h1>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-light">
                Únete a la red vecinal donde el tiempo y las habilidades son la verdadera moneda. Ayuda a reparar un mueble, riega las macetas o pasea mascotas para sumar puntos. Gástalos cuando tú necesites una mano.
              </p>

              <div className="pt-4 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <button 
                  onClick={handleGoogleLogin}
                  className="bg-white text-[#011627] hover:bg-slate-100 font-bold px-6 py-3 rounded-full flex items-center justify-center space-x-2 transition-all shadow-lg active:scale-95"
                >
                  {/* Mock google icon */}
                  <svg className="h-4 w-4 mr-1" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.13-5.136 4.13A5.79 5.79 0 0 1 8 12.75c0-3.19 2.59-5.78 5.78-5.78 1.48 0 2.83.56 3.86 1.47l3.05-3.04A9.97 9.97 0 0 0 13.78 2c-5.52 0-10 4.48-10 10s4.48 10 10 10c5.78 0 10.13-4.11 10.13-9.92 0-.6-.05-1.17-.15-1.79H12.24Z"/>
                  </svg>
                  <span>Continuar con Google</span>
                </button>
                <button 
                  onClick={handleGuestLogin}
                  className="bg-[#FF6B35] hover:bg-[#FF6B35]/95 text-white font-bold px-6 py-3 rounded-full flex items-center justify-center space-x-2 transition-all shadow-lg active:scale-95"
                >
                  <span>Probar como invitado</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              <div className="pt-6 border-t border-white/10 flex flex-wrap gap-4 text-xs text-slate-400">
                <div className="flex items-center space-x-1">
                  <Check className="h-4 w-4 text-[#2EC4B6]" />
                  <span>10 puntos gratis de bienvenida</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Check className="h-4 w-4 text-[#2EC4B6]" />
                  <span>Sin comisiones ni transacciones</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Check className="h-4 w-4 text-[#2EC4B6]" />
                  <span>Totalmente en español</span>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* LOGGED IN NAVIGATION TABS */}
        <div className="flex overflow-x-auto gap-2 border-b border-slate-200 dark:border-slate-800 pb-px mb-6 scrollbar-none">
          <button 
            onClick={() => { setActiveTab("explorar"); setExchangeFilterRole("todos"); }}
            className={`flex items-center space-x-2 py-3 px-4 font-semibold text-sm border-b-2 whitespace-nowrap transition-all duration-200 ${
              activeTab === "explorar" 
                ? "border-[#FF6B35] text-[#FF6B35] dark:border-[#FF6B35] dark:text-[#FF6B35] font-bold" 
                : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>Tablón de Intercambios</span>
          </button>
          
          {currentUser && (
            <button 
              onClick={() => setActiveTab("favores")}
              className={`flex items-center space-x-2 py-3 px-4 font-semibold text-sm border-b-2 whitespace-nowrap transition-all duration-200 ${
                activeTab === "favores" 
                  ? "border-[#FF6B35] text-[#FF6B35] dark:border-[#FF6B35] dark:text-[#FF6B35] font-bold" 
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Mis Favores</span>
              {exchanges.filter(e => e.status === "pendiente" && (e.requesterId === currentUser.id || e.helperId === currentUser.id)).length > 0 && (
                <span className="bg-amber-500 text-white rounded-full px-1.5 py-0.5 text-[10px] font-bold animate-pulse">
                  {exchanges.filter(e => e.status === "pendiente").length}
                </span>
              )}
            </button>
          )}

          <button 
            onClick={() => setActiveTab("mapa")}
            className={`flex items-center space-x-2 py-3 px-4 font-semibold text-sm border-b-2 whitespace-nowrap transition-all duration-200 ${
              activeTab === "mapa" 
                ? "border-[#FF6B35] text-[#FF6B35] dark:border-[#FF6B35] dark:text-[#FF6B35] font-bold" 
                : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <MapIcon className="h-4 w-4" />
            <span>Mapa del Barrio</span>
          </button>

          {currentUser && (
            <button 
              onClick={() => setActiveTab("perfil")}
              className={`flex items-center space-x-2 py-3 px-4 font-semibold text-sm border-b-2 whitespace-nowrap transition-all duration-200 ${
                activeTab === "perfil" 
                  ? "border-[#FF6B35] text-[#FF6B35] dark:border-[#FF6B35] dark:text-[#FF6B35] font-bold" 
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <User className="h-4 w-4" />
              <span>Mi Perfil</span>
            </button>
          )}
        </div>

        {/* TAB CONTENT: EXPLORAR (POST FEED) */}
        {activeTab === "explorar" && (
          <div className="space-y-6">
            
            {/* SEARCH, CATEGORIES & SUB-FILTERS GRID */}
            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-sm space-y-4">
              
              <div className="flex flex-col md:flex-row gap-3">
                {/* Real-time Predictive Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3.5 h-4.5 w-4.5 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Buscar por título, categoría, descripción o vecino..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 pl-10 pr-4 py-3 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/30 focus:border-[#FF6B35] transition-all placeholder:text-slate-400"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Sub-Filters Selector */}
                <div className="flex flex-wrap gap-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-2xl">
                  <button 
                    onClick={() => setSelectedFilter("todos")}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      selectedFilter === "todos" 
                        ? "bg-white dark:bg-slate-950 text-[#FF6B35] shadow-sm" 
                        : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                    }`}
                  >
                    Todo
                  </button>
                  <button 
                    onClick={() => setSelectedFilter("urgente")}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-1 ${
                      selectedFilter === "urgente" 
                        ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 shadow-sm" 
                        : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                    }`}
                  >
                    <AlertTriangle className="h-3 w-3 text-rose-500" />
                    <span>Urgentes</span>
                  </button>
                  <button 
                    onClick={() => setSelectedFilter("nuevos")}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      selectedFilter === "nuevos" 
                        ? "bg-white dark:bg-slate-950 text-[#FF6B35] shadow-sm" 
                        : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                    }`}
                  >
                    Más Nuevos
                  </button>
                  {currentUser && (
                    <button 
                      onClick={() => setSelectedFilter("cercano")}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-1 ${
                        selectedFilter === "cercano" 
                          ? "bg-white dark:bg-slate-950 text-[#FF6B35] shadow-sm" 
                          : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                      }`}
                    >
                      <MapPin className="h-3 w-3" />
                      <span>{currentUser.locationLabel}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Category Pill Tag Strip */}
              <div className="flex overflow-x-auto gap-2 pt-1 pb-2 scrollbar-none border-t border-slate-150 dark:border-slate-850 pt-3">
                {[
                  { key: "todos", label: "🌍 Todos", color: "" },
                  { key: "reparaciones", label: "🛠️ Reparaciones", color: "" },
                  { key: "jardin", label: "🌱 Jardinería", color: "" },
                  { key: "tecnologia", label: "💻 Tecnología", color: "" },
                  { key: "mascotas", label: "🐾 Mascotas", color: "" },
                  { key: "mudanzas", label: "📦 Mudanzas", color: "" },
                  { key: "arte", label: "🎨 Arte y Ocio", color: "" },
                  { key: "otro", label: "🤝 Otros", color: "" }
                ].map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => setSelectedCategory(cat.key)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                      selectedCategory === cat.key 
                        ? "bg-[#FF6B35] text-white border-[#FF6B35] shadow-md" 
                        : "bg-slate-50 dark:bg-slate-900 text-slate-600 hover:text-slate-800 border-slate-200 dark:text-slate-400 dark:hover:text-slate-200 dark:border-slate-800"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

            </div>

            {/* DYNAMIC POSTS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* PUBLISH ACTION BANNER GRID (Only when logged in) */}
              {currentUser && (
                <div 
                  onClick={() => setIsPostModalOpen(true)}
                  className="bg-gradient-to-br from-[#FF6B35]/5 to-white dark:from-slate-950 dark:to-slate-900 border-2 border-dashed border-[#FF6B35]/30 dark:border-slate-800 rounded-3xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#FF6B35] dark:hover:border-slate-700 transition-all hover:shadow-md h-[280px] group"
                >
                  <div className="bg-[#011627] text-white p-3.5 rounded-full shadow-md group-hover:scale-110 transition-transform">
                    <Plus className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200 mt-4">
                    ¿Necesitas algo o quieres ayudar?
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 max-w-[220px] mx-auto">
                    Publica un nuevo favor en el tablón de tu barrio y suma puntos.
                  </p>
                  <span className="bg-[#FF6B35]/15 dark:bg-slate-850 text-[#FF6B35] font-bold text-[11px] px-3 py-1 rounded-full mt-4 group-hover:bg-[#FF6B35]/25 transition-colors">
                    Publicar intercambio
                  </span>
                </div>
              )}

              {displayedPosts.length === 0 ? (
                <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-500">
                  <div className="max-w-xs mx-auto space-y-3">
                    <Layers className="h-10 w-10 mx-auto text-slate-300" />
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200">No se encontraron intercambios</h3>
                    <p className="text-xs">Prueba escribiendo otra palabra o cambia las categorías de búsqueda.</p>
                  </div>
                </div>
              ) : (
                displayedPosts.map((post) => {
                  const catTheme = getCategoryTheme(post.category);
                  const isAuthor = currentUser?.id === post.authorId;
                  const isPostAbierto = post.status === "abierto";

                  return (
                    <motion.div 
                      key={post.id}
                      layout
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-[280px] relative overflow-hidden ${
                        post.isUrgent ? "ring-1 ring-rose-500 bg-rose-50/10 dark:bg-rose-950/5" : ""
                      }`}
                    >
                      {/* Urgent/Type Banner label */}
                      <div className="flex items-center justify-between pointer-events-none">
                        <div className="flex space-x-1.5 items-center">
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                            post.type === "ofrezco" 
                              ? "bg-[#2EC4B6]/10 text-[#2EC4B6] dark:bg-[#2EC4B6]/20 dark:text-[#2EC4B6] border border-[#2EC4B6]/20" 
                              : "bg-[#011627]/10 text-[#011627] dark:bg-[#011627]/30 dark:text-slate-300 border border-[#011627]/15 dark:border-slate-800"
                          }`}>
                            {post.type === "ofrezco" ? "Ofrezco" : "Necesito"}
                          </span>
                          
                          {post.isUrgent && (
                            <span className="bg-rose-500 text-white font-bold text-[9px] uppercase px-1.5 py-0.5 rounded flex items-center space-x-0.5 animate-pulse">
                              <AlertTriangle className="h-2 w-2" />
                              <span>Urgente</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center space-x-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full">
                          <Coins className="h-3 w-3" />
                          <span className="text-xs font-bold text-[11px]">{post.suggestedPoints} pts</span>
                        </div>
                      </div>

                      <div className="mt-3 flex-1 space-y-1">
                        <h4 className="font-bold text-slate-800 dark:text-slate-100 text-[15px] line-clamp-1">
                          {post.title}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed mt-1">
                          {post.description}
                        </p>
                      </div>

                      {/* Footer Metadata */}
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-900 flex items-center justify-between">
                        
                        {/* Author info */}
                        <div className="flex items-center space-x-2">
                          <div className="h-7 w-7 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-300">
                            {post.authorAvatar}
                          </div>
                          <div>
                            <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[100px]">
                              {post.authorName}
                            </p>
                            <p className="text-[10px] text-slate-400 flex items-center">
                              <MapPin className="h-2.5 w-2.5 mr-0.5 flex-shrink-0" />
                              <span>{post.locationLabel}</span>
                            </p>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex space-x-1">
                          <button 
                            onClick={() => setSelectedPostDetail(post)}
                            className="text-xs font-semibold border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-800 dark:hover:text-slate-200 px-3 py-1.5 rounded-xl transition-all"
                          >
                            Ver
                          </button>

                          {isPostAbierto && !isAuthor && currentUser && (
                            <button 
                              onClick={() => {
                                handleInitiateExchange(post.id);
                              }}
                              className="text-xs bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white font-bold px-3 py-1.5 rounded-xl transition-all flex items-center space-x-1 shadow-md shadow-orange-100 dark:shadow-none"
                            >
                              <span>{post.type === "ofrezco" ? "Pedir ayuda" : "Ofrecer ayuda"}</span>
                            </button>
                          )}
                        </div>

                      </div>

                    </motion.div>
                  );
                })
              )}

            </div>
          </div>
        )}

        {/* TAB CONTENT: ACTIVE EXCHANGES ("MIS FAVORES") */}
        {activeTab === "favores" && currentUser && (
          <div className="space-y-6">
            
            {/* 1. INTERACTIVE STATUS CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Green/Teal Card: Te deben X favores */}
              <div 
                onClick={() => setExchangeFilterRole(exchangeFilterRole === "te_deben" ? "todos" : "te_deben")}
                className={`bg-[#2EC4B6]/10 dark:bg-teal-950/20 border-2 rounded-[2rem] p-5 flex items-center justify-between cursor-pointer hover:shadow-md transition-all ${
                  exchangeFilterRole === "te_deben" 
                    ? "border-[#2EC4B6] bg-[#2EC4B6]/20 scale-[1.01]" 
                    : "border-[#2EC4B6]/25 dark:border-teal-900/40"
                }`}
              >
                <div className="space-y-1">
                  <span className="text-[#2EC4B6] dark:text-teal-400 font-bold text-xs uppercase tracking-wider block font-black">
                    Te deben asegurar
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-[#011627] dark:text-teal-300">
                    {countTeDebenFavores()} {countTeDebenFavores() === 1 ? "favor" : "favores"}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug">
                    Pendientes de confirmación del receptor para liberarte puntos.
                  </p>
                </div>
                <div className="bg-[#2EC4B6] text-white p-3 rounded-full shadow-lg">
                  <Coins className="h-6 w-6" />
                </div>
              </div>

              {/* Orange/Yellow Card: Recuerda ayudar a [Name] */}
              <div 
                onClick={() => {
                  if (urgentObligation) {
                    setExchangeFilterRole("debes");
                  } else {
                    alert("¡Estás al día! No tienes obligaciones urgentes activas.");
                  }
                }}
                className={`bg-[#FF9F1C]/10 dark:bg-amber-950/20 border-2 rounded-[2rem] p-5 flex items-center justify-between cursor-pointer hover:shadow-md transition-all ${
                  exchangeFilterRole === "debes" 
                    ? "border-[#FF9F1C] bg-[#FF9F1C]/20 scale-[1.01]" 
                    : "border-[#FF9F1C]/25 dark:border-amber-900/40"
                }`}
              >
                <div className="space-y-1 flex-1 pr-3">
                  <span className="text-[#FF9F1C] dark:text-amber-400 font-bold text-xs uppercase tracking-wider block font-black">
                    Próxima obligación
                  </span>
                  {urgentObligation ? (
                    <>
                      <h3 className="text-sm font-bold text-amber-800 dark:text-amber-300 line-clamp-1">
                        Ayuda a {dataService.getUsers().find(u => u.id === urgentObligation.requesterId)?.name || "un vecino"}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed mt-0.5">
                        Favor: &quot;{urgentObligation.postTitle}&quot;. Ayuda e inicia confirmación.
                      </p>
                    </>
                  ) : (
                    <>
                      <h3 className="text-lg font-bold text-amber-850 dark:text-amber-300">
                        ¡Libre de tareas!
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-none">
                        No tienes servicios activos por realizar actualmente.
                      </p>
                    </>
                  )}
                </div>
                <div className="bg-[#FF9F1C] text-white p-3 rounded-full shadow-lg flex-shrink-0">
                  <AlertTriangle className="h-6 w-6" />
                </div>
              </div>

            </div>

            {/* Header filters bar */}
            <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-semibold text-slate-500">Filtrado activo:</span>
                <span className="text-xs font-bold uppercase tracking-wider bg-slate-150 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded inline-block">
                  {exchangeFilterRole === "todos" && "Todos los favores"}
                  {exchangeFilterRole === "te_deben" && "Te deben confirmar"}
                  {exchangeFilterRole === "debes" && "Tienes pendiente hacer"}
                </span>
                {exchangeFilterRole !== "todos" && (
                  <button 
                    onClick={() => setExchangeFilterRole("todos")}
                    className="text-xs text-[#FF6B35] font-bold hover:underline hover:scale-105"
                  >
                    (ver todo)
                  </button>
                )}
              </div>
            </div>

            {/* EXCHANGES GRID LIST */}
            <div className="space-y-4">
              {(() => {
                let displayedExchanges = exchanges.filter(e => 
                  e.requesterId === currentUser.id || e.helperId === currentUser.id
                );

                if (exchangeFilterRole === "te_deben") {
                  displayedExchanges = displayedExchanges.filter(e => 
                    e.helperId === currentUser.id && e.status === "en_progreso" && !e.requesterConfirmedComplete
                  );
                } else if (exchangeFilterRole === "debes") {
                  displayedExchanges = displayedExchanges.filter(e => 
                    e.helperId === currentUser.id && e.status === "en_progreso"
                  );
                }

                if (displayedExchanges.length === 0) {
                  return (
                    <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-500">
                      <Layers className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                      <p className="text-sm font-medium">No hay intercambios con el filtro actual</p>
                      <button 
                        onClick={() => setExchangeFilterRole("todos")}
                        className="text-xs text-[#FF6B35] font-bold mt-2 underline"
                      >
                        Quitar filtros
                      </button>
                    </div>
                  );
                }

                return displayedExchanges.map((exc) => {
                  const isRequester = exc.requesterId === currentUser.id;
                  const counterpart = dataService.getUsers().find(u => u.id === (isRequester ? exc.helperId : exc.requesterId));
                  const post = posts.find(p => p.id === exc.postId);
                  const showApprovalButton = exc.status === "pendiente" && post?.authorId === currentUser.id;
                  
                  // Status step machine visualization strings in Spanish
                  let stateLabel = "";
                  let stateColor = "";
                  if (exc.status === "pendiente") {
                    stateLabel = "Propuesta Pendiente";
                    stateColor = "text-amber-500 bg-amber-500/10 border-amber-500/20";
                  } else if (exc.status === "en_progreso") {
                    stateLabel = "En Progreso";
                    stateColor = "text-blue-500 bg-blue-500/10 border-blue-500/20";
                  } else if (exc.status === "completado") {
                    stateLabel = "Completado e Intercambiado";
                    stateColor = "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
                  } else if (exc.status === "cancelado") {
                    stateLabel = "Cancelado";
                    stateColor = "text-rose-500 bg-rose-500/10 border-rose-500/20";
                  }

                  return (
                    <div 
                      key={exc.id}
                      className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm transition-all hover:border-slate-300 dark:hover:border-slate-700"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        
                        <div className="space-y-2">
                          {/* Header Line */}
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${stateColor}`}>
                              {stateLabel}
                            </span>
                            <span className="bg-amber-100 dark:bg-amber-950/45 text-amber-700 dark:text-amber-400 text-xs font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                              <Coins className="h-3 w-3" />
                              <span>{exc.points} pts</span>
                            </span>
                            <span className="text-xs text-slate-400">
                              Iniciado {new Date(exc.createdAt).toLocaleDateString("es-ES")}
                            </span>
                          </div>

                          {/* Favor title */}
                          <h4 className="font-bold text-lg text-slate-800 dark:text-slate-100">
                            {exc.postTitle}
                          </h4>

                          {/* Role detail */}
                          <div className="flex items-center space-x-3 text-xs text-slate-600 dark:text-slate-300 pt-0.5">
                            <span className="font-semibold text-slate-400 uppercase tracking-widest text-[9px]">
                              {isRequester ? "Receptor de ayuda" : "Proveedor del favor"}
                            </span>
                            <span>•</span>
                            <div className="flex items-center space-x-1.5">
                              <span className="text-slate-400">Vecino:</span>
                              <strong className="text-[#FF6B35] font-bold">{counterpart?.name || "Vecino Invitado"}</strong>
                              <span className="text-[10px] bg-slate-100 dark:bg-slate-850 px-1.5 py-0.5 rounded text-slate-500 font-medium">
                                ({counterpart?.locationLabel})
                              </span>
                            </div>
                          </div>

                        </div>

                        {/* EXCHANGES CTAS & ACTIONS PANEL */}
                        <div className="flex flex-wrap items-center gap-2 sm:self-center">
                          
                          {/* Action for Author checking pending proposal */}
                          {showApprovalButton && (
                            <button 
                              onClick={() => handleAcceptExchange(exc.id)}
                              className="bg-[#2EC4B6] hover:bg-[#2EC4B6]/90 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md active:scale-95"
                            >
                              Aceptar propuesta
                            </button>
                          )}

                          {/* Requester dual-confirmation completion step */}
                          {exc.status === "en_progreso" && (
                            <>
                              {/* If you are the receiver of the favor */}
                              {isRequester ? (
                                exc.requesterConfirmedComplete ? (
                                  <div className="flex items-center space-x-1 border border-emerald-200 dark:border-emerald-800/40 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold px-3 py-2 rounded-xl">
                                    <Check className="h-4 w-4" />
                                    <span>Confirmado por ti</span>
                                  </div>
                                ) : (
                                  <button 
                                    onClick={() => handleCompleteExchange(exc.id)}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md active:scale-95"
                                  >
                                    Confirmar que recibí ayuda
                                  </button>
                                )
                              ) : (
                                /* If you are the provider of the favor */
                                exc.helperConfirmedComplete ? (
                                  <div className="flex items-center space-x-1 border border-emerald-200 dark:border-emerald-800/40 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold px-3 py-2 rounded-xl">
                                    <Check className="h-4 w-4" />
                                    <span>Confirmado por ti</span>
                                  </div>
                                ) : (
                                  <button 
                                    onClick={() => handleCompleteExchange(exc.id)}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md active:scale-95"
                                  >
                                    Confirmar que ayudé
                                  </button>
                                )
                              )}
                            </>
                          )}

                          {/* Cancellation option / Pending notes */}
                          {["pendiente", "en_progreso"].includes(exc.status) && (
                            <button 
                              onClick={() => setCancelExchangePromptId(exc.id)}
                              className="p-2 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-rose-500 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl transition-colors"
                              title="Cancelar intercambio"
                            >
                              <Trash className="h-4 w-4" />
                            </button>
                          )}

                          {/* Finished states metadata */}
                          {exc.status === "completado" && (
                            <div className="flex items-center space-x-1.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 font-bold text-xs px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-900">
                              <CheckCircle2 className="h-4 w-4" />
                              <span>Fin de intercambio</span>
                            </div>
                          )}

                          {exc.status === "cancelado" && (
                            <div className="bg-rose-50 dark:bg-rose-950/20 text-rose-500 font-medium text-xs px-3 py-1.5 rounded-lg">
                              Cancelado
                            </div>
                          )}

                        </div>

                      </div>

                      {/* Display dual confirmation instructions on active trades */}
                      {exc.status === "en_progreso" && (
                        <div className="mt-3.5 pt-3.5 border-t border-dashed border-slate-100 dark:border-slate-900 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-500">
                          <div className="flex items-center space-x-2">
                            <span className={`h-2.5 w-2.5 rounded-full ${exc.requesterConfirmedComplete ? "bg-emerald-500" : "bg-slate-300 animate-pulse"}`} />
                            <span>
                              Receptor: {exc.requesterConfirmedComplete ? "Confirmado" : "Pendiente de confirmar"}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`h-2.5 w-2.5 rounded-full ${exc.helperConfirmedComplete ? "bg-emerald-500" : "bg-slate-300 animate-pulse"}`} />
                            <span>
                              Ayudante: {exc.helperConfirmedComplete ? "Confirmado" : "Pendiente de confirmar"}
                            </span>
                          </div>
                          <p className="sm:col-span-2 text-[11px] text-[#FF6B35] font-semibold flex items-center gap-1.5 mt-1 bg-[#FF6B35]/10 dark:bg-slate-900 p-2 rounded-lg">
                            <Info className="h-3.5 w-3.5 shrink-0" />
                            <span>Ambos debéis pulsar &quot;Confirmar&quot; para validar el favor y transferir los {exc.points} puntos de la cuenta de {isRequester ? "tu cuenta" : counterpart?.name} a {isRequester ? counterpart?.name : "la tuya"}.</span>
                          </p>
                        </div>
                      )}

                    </div>
                  );
                });
              })()}
            </div>
          </div>
        )}

        {/* TAB CONTENT: INTERACTIVE SVG NEIGHBORHOOD MAP */}
        {activeTab === "mapa" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-sm">
              <div className="max-w-3xl mx-auto space-y-4">
                
                <div className="space-y-1">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center">
                    <MapIcon className="h-5.5 w-5.5 text-[#FF6B35] mr-2" />
                    <span>Mapa de Intercambios del Barrio</span>
                  </h1>
                  <p className="text-xs text-slate-500 leading-relaxed font-light">
                    Visualiza en tiempo real en qué distritos del centro de Madrid se concentran los favores vecinales disponibles. Los círculos indican la cantidad total de favores registrados en esa zona. <strong>Pulsa sobre un vecindario para ver sus publicaciones.</strong>
                  </p>
                </div>

                {/* THE SCHEMATIC INTERACTIVE BOARD MAP */}
                <div className="relative border border-slate-200 dark:border-slate-850 bg-[#FF6B35]/5 dark:bg-slate-900/60 rounded-3xl overflow-hidden shadow-inner h-[380px] sm:h-[450px]">
                  
                  {/* Decorative schematic street paths & grids */}
                  <div className="absolute inset-0 opacity-15 dark:opacity-5 pointer-events-none">
                    <svg width="100%" height="100%">
                      <defs>
                        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#grid)" />
                      {/* Abstract radial streets */}
                      <circle cx="50%" cy="50%" r="100" fill="none" stroke="currentColor" strokeWidth="1.5" />
                      <circle cx="50%" cy="50%" r="200" fill="none" stroke="currentColor" strokeWidth="1.5" />
                      <line x1="0" y1="0" x2="100%" y2="100%" stroke="currentColor" strokeWidth="1.5" />
                      <line x1="100%" y1="0" x2="0" y2="100%" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </div>

                  {/* Madrid park and limits outlines */}
                  <div className="absolute top-1/4 right-[5%] w-24 h-52 bg-emerald-500/10 dark:bg-emerald-400/5 rounded-full blur-xl pointer-events-none flex items-center justify-center">
                    <span className="text-[10px] text-emerald-600/40 dark:text-emerald-400/20 tracking-wider font-bold rotate-90">PARQUE DEL RETIRO</span>
                  </div>
                  <div className="absolute bottom-5 left-[5%] w-32 h-20 bg-emerald-500/10 dark:bg-emerald-400/5 rounded-full blur-xl pointer-events-none flex items-center justify-center">
                    <span className="text-[10px] text-emerald-600/40 dark:text-emerald-400/20 tracking-wider font-bold">RÍO MANZANARES</span>
                  </div>

                  {/* PLOTTING NEIGHBORHOODS TARGET MARKERS */}
                  {Object.entries(NEIGHBORHOOD_COORDS).map(([name, coords]) => {
                    // Count open posts in this neighborhood
                    const zonePosts = posts.filter(p => p.locationLabel === name && p.status === "abierto");
                    const isSelected = selectedMapNeighborhood === name;

                    return (
                      <div 
                        key={name}
                        onClick={() => setSelectedMapNeighborhood(name === selectedMapNeighborhood ? null : name)}
                        style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
                      >
                        {/* Pulse Ring */}
                        {zonePosts.length > 0 && (
                          <span className="absolute -inset-2.5 rounded-full bg-[#FF6B35]/35 animate-ping" />
                        )}

                        <div className={`flex flex-col items-center justify-center transition-all ${
                          isSelected ? "scale-115" : "hover:scale-108"
                        }`}>
                          
                          {/* Pin visual */}
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs ring-4 shadow-xl transition-all ${
                            isSelected 
                              ? "bg-[#FF6B35] text-white ring-orange-100 dark:ring-orange-950/40"
                              : zonePosts.length > 0
                                ? "bg-white dark:bg-slate-950 text-[#FF6B35] ring-orange-50 dark:ring-slate-800"
                                : "bg-slate-200 dark:bg-slate-800 text-slate-400 ring-slate-100 dark:ring-slate-900"
                          }`}>
                            {zonePosts.length}
                          </div>

                          {/* Label Box */}
                          <div className={`mt-1.5 px-2 py-0.5 rounded-lg border text-[10px] font-bold shadow-md whitespace-nowrap tracking-wide transition-all ${
                            isSelected
                              ? "bg-[#011627] text-white border-[#FF6B35]"
                              : "bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-850"
                          }`}>
                            {name}
                          </div>

                        </div>
                      </div>
                    );
                  })}

                </div>

                {/* BOTTOM SIDEBAR POSTS LISTING IN SELECTED NEIGHBORHOOD */}
                <AnimatePresence>
                  {selectedMapNeighborhood && (
                    <motion.div 
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 15 }}
                      className="bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-2xl p-4 mt-4"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4.5 w-4.5 text-[#FF6B35]" />
                          <h3 className="font-extrabold text-base text-slate-800 dark:text-white">
                            Intercambios activos en: <span className="text-[#FF6B35] font-black">{selectedMapNeighborhood}</span>
                          </h3>
                        </div>
                        <button 
                          onClick={() => setSelectedMapNeighborhood(null)}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        >
                          <X className="h-4.5 w-4.5" />
                        </button>
                      </div>

                      {(() => {
                        const neighborhoodPosts = posts.filter(p => p.locationLabel === selectedMapNeighborhood && p.status === "abierto");
                        if (neighborhoodPosts.length === 0) {
                          return (
                            <p className="text-xs text-slate-500 text-center py-4 italic">
                              No hay publicaciones creadas de momento en este distrito. ¡Sé el primero en publicar una!
                            </p>
                          );
                        }

                        return (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {neighborhoodPosts.map((post) => (
                              <div 
                                key={post.id}
                                className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-4 rounded-xl flex flex-col justify-between"
                              >
                                <div>
                                  <div className="flex justify-between items-start mb-1.5">
                                    <span className={`text-[9px] font-bold tracking-tight uppercase px-2 py-0.5 rounded-full ${
                                      post.type === "ofrezco" ? "bg-teal-50 text-teal-700 dark:bg-teal-950/20" : "bg-[#011627]/15 text-[#011627] dark:bg-[#011627]/30 dark:text-slate-350 border border-[#011627]/10"
                                    }`}>
                                      {post.type === "ofrezco" ? "Ofrezco" : "Necesito"}
                                    </span>
                                    <span className="text-xs font-bold text-amber-600">{post.suggestedPoints} pts</span>
                                  </div>
                                  <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 line-clamp-1">
                                    {post.title}
                                  </h4>
                                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                                    {post.description}
                                  </p>
                                </div>
                                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-900 flex justify-between items-center">
                                  <span className="text-[10px] text-slate-400 font-medium">Por {post.authorName}</span>
                                  <button 
                                    onClick={() => setSelectedPostDetail(post)}
                                    className="bg-[#FF6B35] hover:bg-[#FF6B35]/95 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all"
                                  >
                                    Ver detalles
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            </div>
          </div>
        )}

        {/* TAB CONTENT: PROFILE DETAILS & EDITING */}
        {activeTab === "perfil" && currentUser && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm max-w-2xl mx-auto">
              
              <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-900 pb-5">
                <div className="flex items-center space-x-4">
                  <div className="h-14 w-14 rounded-full bg-gradient-to-tr from-[#FF6B35] to-[#FF9F1C] text-white font-extrabold text-xl flex items-center justify-center shadow-lg shadow-orange-200/40 dark:shadow-none">
                    {currentUser.avatar.length <= 2 ? currentUser.avatar : "👥"}
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">
                      {currentUser.name}
                    </h2>
                    <p className="text-xs text-slate-400 flex items-center mt-0.5">
                      <MapPin className="h-3 w-3 mr-0.5" />
                      <span>{currentUser.locationLabel}, Madrid</span>
                    </p>
                  </div>
                </div>

                {!isEditingProfile && (
                  <button 
                    onClick={() => {
                      setIsEditingProfile(true);
                      setEditedName(currentUser.name);
                      setEditedBio(currentUser.bio);
                      setEditedLocation(currentUser.locationLabel);
                      setProfileSkills(currentUser.skills);
                    }}
                    className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400 rounded-xl transition-all flex items-center space-x-1.5 text-xs font-semibold"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Editar</span>
                  </button>
                )}
              </div>

              {/* PROFILE FORM (READ ONLY OR EDITING) */}
              {isEditingProfile ? (
                <form onSubmit={handleUpdateProfile} className="space-y-4 pt-4">
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Nombre completo
                      </label>
                      <input 
                        type="text" 
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/30 focus:border-[#FF6B35] transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Tu Vecindario
                      </label>
                      <select 
                        value={editedLocation}
                        onChange={(e) => setEditedLocation(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/30 focus:border-[#FF6B35] transition-all"
                      >
                        {Object.keys(NEIGHBORHOOD_COORDS).map(loc => (
                          <option key={loc} value={loc}>{loc}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Biografía corta o presentación
                    </label>
                    <textarea 
                      value={editedBio}
                      onChange={(e) => setEditedBio(e.target.value)}
                      rows={3}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/30 focus:border-[#FF6B35] transition-all"
                    />
                  </div>

                  {/* Skills/Habilidades Pill Selector Form */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Habilidades e Intereses
                    </label>
                    <div className="flex space-x-2 mb-2">
                      <input 
                        type="text" 
                        value={newSkillText}
                        onChange={(e) => setNewSkillText(e.target.value)}
                        placeholder="Ej. Cambio de bombillas, Clases de Alemán..."
                        className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/30 focus:border-[#FF6B35] transition-all"
                      />
                      <button 
                        type="button"
                        onClick={handleAddSkill}
                        className="bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white font-bold px-4 py-2 rounded-xl text-xs active:scale-95 transition-transform"
                      >
                        Añadir
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 min-h-[40px] border border-slate-150 dark:border-slate-900 p-2.5 rounded-xl bg-slate-50/50 dark:bg-slate-900/40">
                      {profileSkills.length === 0 ? (
                        <span className="text-[11px] text-slate-400">Sin etiquetas de habilidad agregadas</span>
                      ) : (
                        profileSkills.map(skill => (
                          <span 
                            key={skill}
                            className="bg-[#011627]/5 dark:bg-[#011627]/30 text-[#011627] dark:text-slate-300 font-semibold text-xs py-1 px-2.5 rounded-full flex items-center space-x-1 border border-[#011627]/10 dark:border-slate-800"
                          >
                            <span>{skill}</span>
                            <button 
                              type="button" 
                              onClick={() => handleRemoveSkill(skill)}
                              className="text-[#FF6B35] hover:text-[#FF6B35]/80"
                            >
                              <X className="h-3 w-3 ml-1" />
                            </button>
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-2">
                    <button 
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className="px-4 py-2 border border-slate-200 dark:border-slate-850 text-slate-600 dark:text-slate-400 rounded-xl text-xs font-semibold"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit"
                      className="px-4 py-2 bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white font-bold rounded-xl text-xs shadow-md shadow-orange-200/25 dark:shadow-none"
                    >
                      Guardar Cambios
                    </button>
                  </div>

                </form>
              ) : (
                <div className="space-y-6 pt-4">
                  
                  {/* Bio read content */}
                  <div>
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                      Presentación
                    </h5>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
                      &quot;{currentUser.bio || "Este vecino aún no ha escrito una presentación..."}&quot;
                    </p>
                  </div>

                  {/* Skills tags view */}
                  <div>
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                      Habilidades del vecino
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {currentUser.skills.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">No tienes habilidades cargadas.</p>
                      ) : (
                        currentUser.skills.map(sk => (
                          <span 
                            key={sk} 
                            className="bg-[#011627]/5 dark:bg-[#011627]/20 text-[#011627] dark:text-slate-300 font-semibold text-xs py-1 px-3 border border-[#011627]/10 dark:border-slate-800 rounded-full"
                          >
                            {sk}
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Stats Cards Section */}
                  <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-900 pt-5">
                    
                    <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl text-center">
                      <h4 className="text-2xl font-black text-[#FF6B35]">
                        {currentUser.favorsDone}
                      </h4>
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-1">
                        Favores Prestados
                      </p>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl text-center">
                      <h4 className="text-2xl font-black text-[#FF6B35]">
                        {currentUser.favorsReceived}
                      </h4>
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-1">
                        Favores Recibidos
                      </p>
                    </div>

                  </div>

                  {/* Metadata member info */}
                  <div className="text-[10px] text-center text-slate-400 font-mono">
                    MIEMBRO DEL BARRIO DESDE {new Date(currentUser.memberSince).toLocaleDateString("es-ES", { year: "numeric", month: "long" }).toUpperCase()}
                  </div>

                  {/* SIMULADOR MULTI-PERFIL (Testing Tool) */}
                  <div className="mt-8 pt-6 border-t border-dashed border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center space-x-1.5 text-[#FF6B35]">
                      <Sparkles className="h-4 w-4" />
                      <h5 className="text-xs font-black uppercase tracking-wider">
                        Simulador de Vecinos (Testing)
                      </h5>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Cambia instantáneamente a otro perfil de vecino para proponer o aceptar intercambios desde su perspectiva.
                    </p>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {dataService.getUsers().filter(u => u.id !== currentUser.id).map(user => (
                        <button
                          key={user.id}
                          onClick={() => {
                            const switchedUser = dataService.loginAsUserProfile(user.id);
                            if (switchedUser) {
                              setCurrentUser(switchedUser);
                              setEditedName(switchedUser.name);
                              setEditedBio(switchedUser.bio);
                              setEditedLocation(switchedUser.locationLabel);
                              setProfileSkills(switchedUser.skills);
                              refreshData();
                              setShowExchangeSuccessModal(`Has cambiado al perfil de ${switchedUser.name}`);
                            }
                          }}
                          className="flex items-center space-x-1.5 p-2 rounded-xl text-left border border-slate-100 dark:border-slate-900 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all text-xs"
                        >
                          <div className="h-5 w-5 rounded-full bg-[#FF6B35] text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                            {user.avatar.substring(0, 2)}
                          </div>
                          <span className="truncate font-semibold text-slate-700 dark:text-slate-300">
                            {user.name.split(" ")[0]} ({user.locationLabel})
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                </div>
              )}

            </div>
          </div>
        )}

      </main>

      {/* FLOAT ACTION BUTTON FOR RAPID PUBLISHING */}
      {currentUser && (
        <button 
          onClick={() => {
            setPostFormError("");
            setIsPostModalOpen(true);
          }}
          className="fixed bottom-6 right-6 z-30 bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white font-bold h-14 px-5 rounded-full shadow-2xl flex items-center justify-center space-x-2 transition-all hover:scale-105 active:scale-95 shadow-orange-500/20 dark:shadow-none"
          id="action-float-post"
        >
          <Plus className="h-5.5 w-5.5" />
          <span className="text-sm font-bold">Publicar</span>
        </button>
      )}

      {/* MODAL: POST DETAILS DIALOG */}
      <AnimatePresence>
        {selectedPostDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl relative overflow-hidden"
            >
              <button 
                onClick={() => setSelectedPostDetail(null)}
                className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="space-y-4">
                
                {/* Visual Pill Types Header */}
                <div className="flex items-center space-x-2 pt-2">
                  <span className={`text-[10px] font-bold uppercase py-0.5 px-2.5 rounded-full border ${
                    selectedPostDetail.type === "ofrezco" 
                      ? "bg-teal-50 text-teal-700 border-teal-100 dark:bg-teal-950/20 dark:text-teal-400" 
                      : "bg-[#011627]/15 text-[#011627] border-[#011627]/10 dark:bg-[#011627]/30 dark:text-slate-350"
                  }`}>
                    {selectedPostDetail.type === "ofrezco" ? "Ofrece ayuda" : "Necesita ayuda"}
                  </span>
                  
                  {selectedPostDetail.isUrgent && (
                    <span className="bg-rose-500 text-white text-[9px] uppercase font-bold px-1.5 py-0.5 rounded flex items-center space-x-0.5">
                      <AlertTriangle className="h-2.5 w-2.5" />
                      <span>Urgente</span>
                    </span>
                  )}

                  <span className="text-[11px] font-bold text-slate-400 font-mono">
                    ID: {selectedPostDetail.id.slice(0, 10)}
                  </span>
                </div>

                {/* Post Title */}
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-800 dark:text-white">
                  {selectedPostDetail.title}
                </h3>

                {/* Suggested Points Visual */}
                <div className="bg-amber-500/10 border border-amber-500/15 p-3 rounded-xl flex items-center justify-between">
                  <span className="text-xs text-amber-800 dark:text-amber-400 font-bold">
                    Recompensa de intercambio negociada
                  </span>
                  <div className="flex items-center space-x-1 font-black text-amber-700 dark:text-amber-400">
                    <Coins className="h-4.5 w-4.5" />
                    <span>{selectedPostDetail.suggestedPoints} pts</span>
                  </div>
                </div>

                {/* Detailed Description */}
                <div>
                  <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Detalles del favor
                  </h5>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-850">
                    {selectedPostDetail.description}
                  </p>
                </div>

                {/* Details Meta Block */}
                <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Publicado por</span>
                    <strong className="text-slate-700 dark:text-slate-300 font-bold">{selectedPostDetail.authorName}</strong>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Zona de Madrid</span>
                    <strong className="text-[#FF6B35] font-black flex items-center gap-0.5">
                      <MapPin className="h-3 w-3 inline" />
                      <span>{selectedPostDetail.locationLabel}</span>
                    </strong>
                  </div>
                </div>

                {/* CONFIRM / SUBMIT ACTION BUTTON */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-900 flex justify-end space-x-2">
                  <button 
                    onClick={() => setSelectedPostDetail(null)}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-850 text-slate-600 dark:text-slate-400 rounded-xl text-xs font-semibold"
                  >
                    Salir
                  </button>

                  {selectedPostDetail.status === "abierto" && currentUser?.id !== selectedPostDetail.authorId && currentUser && (
                    <button 
                      onClick={() => handleInitiateExchange(selectedPostDetail.id)}
                      className="px-4 py-2 bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white font-bold rounded-xl text-xs shadow-md shadow-orange-200/25 dark:shadow-none transition-all active:scale-95"
                    >
                      {selectedPostDetail.type === "ofrezco" ? "Pedir favor" : "Ofrecer ayuda vecinal"}
                    </button>
                  )}
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* INTERCHANGE FORM MODAL / SIDE SHEET */}
      <AnimatePresence>
        {isPostModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <button 
                onClick={() => setIsPostModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="space-y-4">
                <div className="space-y-1 pt-2">
                  <h3 className="text-lg sm:text-xl font-extrabold text-slate-800 dark:text-white">
                    Publicar favor o servicio
                  </h3>
                  <p className="text-xs text-slate-400">
                    Añade los detalles del intercambio. En la Fase 1, se almacenará de manera in-memory con persistencia local.
                  </p>
                </div>

                {postFormError && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-600 p-3 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>{postFormError}</span>
                  </div>
                )}

                <form onSubmit={handleCreatePostSubmit} className="space-y-4">
                  
                  {/* Select type */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Tipo de publicación
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        type="button"
                        onClick={() => setNewPostType("necesito")}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                          newPostType === "necesito" 
                            ? "bg-[#011627] text-white border-[#011627]" 
                            : "bg-slate-50 dark:bg-slate-900 text-slate-600 border-slate-200 dark:text-slate-400 dark:border-slate-800"
                        }`}
                      >
                        Necesito ayuda (Pago pts)
                      </button>
                      <button 
                        type="button"
                        onClick={() => setNewPostType("ofrezco")}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                          newPostType === "ofrezco" 
                            ? "bg-teal-600 text-white border-teal-600" 
                            : "bg-slate-50 dark:bg-slate-900 text-slate-600 border-slate-200 dark:text-slate-400 dark:border-slate-800"
                        }`}
                      >
                        Ofrezco ayuda (Recibo pts)
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Título o acción del favor
                    </label>
                    <input 
                      type="text" 
                      value={newPostTitle}
                      onChange={(e) => setNewPostTitle(e.target.value)}
                      placeholder="Ej. Limpieza de hojas en jardín, Clases de guitarra..."
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/35 focus:border-[#FF6B35] transition-all"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Categoría de intercambio
                      </label>
                      <select 
                        value={newPostCategory}
                        onChange={(e) => setNewPostCategory(e.target.value as Post["category"])}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/35 focus:border-[#FF6B35] transition-all"
                      >
                        <option value="reparaciones">🛠️ Reparaciones</option>
                        <option value="jardin">🌱 Jardinería</option>
                        <option value="tecnologia">💻 Tecnología</option>
                        <option value="mascotas">🐾 Mascotas</option>
                        <option value="mudanzas">📦 Mudanzas</option>
                        <option value="arte">🎨 Arte y Ocio</option>
                        <option value="otro">🤝 Otros</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Puntos sugeridos
                      </label>
                      <input 
                        type="number" 
                        min={1} 
                        value={newPostPoints}
                        onChange={(e) => setNewPostPoints(Number(e.target.value))}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/35 focus:border-[#FF6B35] transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Vecindario (Madrid)
                      </label>
                      <select 
                        value={newPostLocation}
                        onChange={(e) => setNewPostLocation(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/35 focus:border-[#FF6B35] transition-all"
                      >
                        {Object.keys(NEIGHBORHOOD_COORDS).map(loc => (
                          <option key={loc} value={loc}>{loc}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center space-x-2 self-center pt-3">
                      <input 
                        type="checkbox" 
                        id="is-urgent" 
                        checked={newPostUrgent} 
                        onChange={(e) => setNewPostUrgent(e.target.checked)}
                        className="h-4 w-4 text-[#FF6B35] focus:ring-[#FF6B35] border-slate-300 rounded"
                      />
                      <label htmlFor="is-urgent" className="text-xs text-slate-600 dark:text-slate-300 font-semibold cursor-pointer">
                        ¿Es urgente hoy?
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Descripción detallada (máximo detalle para ayudar con confianza)
                    </label>
                    <textarea 
                      value={newPostDescription}
                      onChange={(e) => setNewPostDescription(e.target.value)}
                      placeholder="Explica qué harás, qué herramientas traes o qué necesitas exactamente..."
                      rows={3}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/35 focus:border-[#FF6B35] transition-all"
                      required
                    />
                  </div>

                  <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-900">
                    <button 
                      type="button"
                      onClick={() => setIsPostModalOpen(false)}
                      className="px-4 py-2 border border-slate-200 dark:border-slate-850 text-slate-600 dark:text-slate-400 rounded-xl text-xs font-semibold"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit"
                      className="px-4 py-2 bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white font-bold rounded-xl text-xs shadow-md shadow-orange-200/25 dark:shadow-none transition-all active:scale-95"
                    >
                      Publicar en el Barrio
                    </button>
                  </div>

                </form>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: SUCCESS TOASTER OVERLAY */}
      <AnimatePresence>
        {showExchangeSuccessModal && (
          <div className="fixed bottom-6 left-6 z-50 bg-slate-900 text-white dark:bg-white dark:text-slate-950 px-5 py-4 rounded-2xl shadow-2xl border border-slate-800 dark:border-slate-200 flex items-center justify-between space-x-4 max-w-sm">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-5.5 w-5.5 text-emerald-400 shrink-0" />
              <p className="text-xs font-medium">{showExchangeSuccessModal}</p>
            </div>
            <button 
              onClick={() => setShowExchangeSuccessModal("")}
              className="text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </AnimatePresence>

      {/* CONFIRM DIALOG: CANCEL TRADE */}
      <AnimatePresence>
        {cancelExchangePromptId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl text-center space-y-4"
            >
              <div className="bg-rose-500/15 text-rose-500 h-10 w-10 mx-auto rounded-full flex items-center justify-center">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-base text-slate-800 dark:text-white">
                  ¿Cancelar esta solicitud?
                </h4>
                <p className="text-xs text-slate-500">
                  Esta acción es destructiva. Se liberará la publicación para otros vecinos y se notificará a tu contraparte.
                </p>
              </div>
              <div className="flex gap-2 justify-center pt-2">
                <button 
                  onClick={() => setCancelExchangePromptId(null)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-850 text-slate-600 dark:text-slate-400 rounded-xl text-xs font-semibold"
                >
                  Mantener comercio
                </button>
                <button 
                  onClick={() => handleCancelExchange(cancelExchangePromptId)}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-md"
                >
                   Sí, cancelar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONFIRM DIALOG: LOG OUT */}
      <AnimatePresence>
        {logoutPrompt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl text-center space-y-4"
            >
              <div className="bg-[#FF6B35]/15 text-[#FF6B35] h-10 w-10 mx-auto rounded-full flex items-center justify-center">
                <LogOut className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-base text-slate-800 dark:text-white">
                  ¿Cerrar sesión de Intercambio?
                </h4>
                <p className="text-xs text-slate-500">
                  Se limpiará tu ID activo de sesión. Al volver, podrás ingresar de nuevo de forma simulada.
                </p>
              </div>
              <div className="flex gap-2 justify-center pt-2">
                <button 
                  onClick={() => setLogoutPrompt(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-850 text-slate-600 dark:text-slate-400 rounded-xl text-xs font-semibold"
                >
                  Volver al tablón
                </button>
                <button 
                  onClick={handleLogOut}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-md"
                >
                   Cerrar sesión
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
