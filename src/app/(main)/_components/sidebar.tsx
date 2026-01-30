"use client";

import { ChevronsLeft, MenuIcon, Plus, PlusCircle, Search, Settings, Trash, FileIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { ElementRef, useEffect, useRef, useState } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { UserItem } from "./user-item";
import { Item } from "./item";
import { createDocument, getRootDocuments } from "@/actions/documents";
import { getTrash } from "@/actions/trash";
import { DocumentList } from "./document-list";
import { TrashBox } from "./trash-box";
import { SidebarProvider, useSidebarRefresh } from "./sidebar-context";
import { SearchCommand } from "@/components/search-command";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { SidebarBreadcrumbs } from "./sidebar-breadcrumbs";

export const Sidebar = () => {
  return (
    <SidebarProvider>
      <SidebarContent />
    </SidebarProvider>
  );
};

const SidebarContent = () => {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { refreshSidebar, refreshKey } = useSidebarRefresh();
  const isResizingRef = useRef(false);
  const sidebarRef = useRef<ElementRef<"aside">>(null);
  const navbarRef = useRef<ElementRef<"div">>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(isMobile);
  const [trashDocuments, setTrashDocuments] = useState<any[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const mainElement = document.querySelector("main");
    if (!mainElement) return;

    const handleScroll = () => {
      if (mainElement.scrollTop > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    mainElement.addEventListener("scroll", handleScroll);
    return () => mainElement.removeEventListener("scroll", handleScroll);
  }, [isMounted]);

  // Data State
  const [personalDocs, setPersonalDocs] = useState<any[]>([]);
  const [sharedDocs, setSharedDocs] = useState<any[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // Pagination State
  const [personalLimit, setPersonalLimit] = useState(5);
  const [personalPage, setPersonalPage] = useState(0);
  const [sharedPage, setSharedPage] = useState(0);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setIsScrolled(false);
  }, [pathname]);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const { personalDocuments, sharedDocuments } = await getRootDocuments();
        setPersonalDocs(personalDocuments);
        setSharedDocs(sharedDocuments);
      } catch (error) {
        console.error("Failed to fetch sidebar documents", error);
      }
    };
    fetchDocs();
  }, [refreshKey, pathname]); // Re-fetch on refresh or path change

  useEffect(() => {
    getTrash().then(setTrashDocuments);
  }, [refreshKey, pathname]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    if (isMobile) {
      collapse();
    } else {
      resetWidth();
    }
  }, [isMobile]);

  useEffect(() => {
    if (isMobile) {
      collapse();
    }
  }, [pathname, isMobile]);

  const handleMouseDown = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    event.preventDefault();
    event.stopPropagation();

    isResizingRef.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (!isResizingRef.current) return;
    let newWidth = event.clientX;

    if (newWidth < 240) newWidth = 240;
    if (newWidth > 480) newWidth = 480;

    if (sidebarRef.current && navbarRef.current) {
      sidebarRef.current.style.width = `${newWidth}px`;
      navbarRef.current.style.setProperty("left", `${newWidth}px`);
      navbarRef.current.style.setProperty("width", `calc(100% - ${newWidth}px)`);
    }
  };

  const handleMouseUp = () => {
    isResizingRef.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const resetWidth = () => {
    if (sidebarRef.current && navbarRef.current) {
      setIsCollapsed(false);
      setIsResetting(true);

      sidebarRef.current.style.width = isMobile ? "100%" : "240px";
      navbarRef.current.style.setProperty(
        "width",
        isMobile ? "0" : "calc(100% - 240px)"
      );
      navbarRef.current.style.setProperty(
        "left",
        isMobile ? "100%" : "240px"
      );
      setTimeout(() => setIsResetting(false), 300);
    }
  };

  const collapse = () => {
    if (sidebarRef.current && navbarRef.current) {
      setIsCollapsed(true);
      setIsResetting(true);

      sidebarRef.current.style.width = "0";
      navbarRef.current.style.setProperty("width", "100%");
      navbarRef.current.style.setProperty("left", "0");
      setTimeout(() => setIsResetting(false), 300);
    }
  };

  const handleCreate = () => {
    const promise = createDocument({ title: "Untitled" })
      .then(() => {
        refreshSidebar();
        router.refresh();
      });

    toast.promise(promise, {
      loading: "Creating a new note...",
      success: "New note created!",
      error: "Failed to create a new note."
    });
  };

  const onExpand = (documentId: string) => {
    setExpanded(prev => ({
      ...prev,
      [documentId]: !prev[documentId]
    }));
  };

  const onRedirect = (documentId: string) => {
    router.push(`/documents/${documentId}`);
  };

  // Pagination Logic
  const getPaginatedPersonalDocs = () => {
    if (personalLimit <= 5) {
      return personalDocs.slice(0, 5);
    }
    // If expanded to 15 or more, use pagination
    const start = personalPage * 15;
    return personalDocs.slice(start, start + 15);
  };

  const getPaginatedSharedDocs = () => {
    const start = sharedPage * 3;
    return sharedDocs.slice(start, start + 3);
  };

  const showMorePersonal = () => {
    setPersonalLimit(15);
  };

  const nextPersonalPage = () => {
    if ((personalPage + 1) * 15 < personalDocs.length) {
      setPersonalPage(p => p + 1);
    }
  };

  const prevPersonalPage = () => {
    if (personalPage > 0) {
      setPersonalPage(p => p - 1);
    }
  };

  const nextSharedPage = () => {
    if ((sharedPage + 1) * 3 < sharedDocs.length) {
      setSharedPage(p => p + 1);
    }
  };

  const prevSharedPage = () => {
    if (sharedPage > 0) {
      setSharedPage(p => p - 1);
    }
  };

  return (
    <>
      <aside
        ref={sidebarRef}
        className={cn(
          "group/sidebar h-full bg-secondary relative flex w-60 flex-col z-[99999] overflow-hidden",
          isResetting && "transition-all ease-in-out duration-300",
          isMobile && "w-0"
        )}
      >
        {/* Logo Section */}
        <div className="pl-4 pr-3 py-3 flex items-center gap-x-2 mb-2">
          <div className="h-6 w-6 bg-primary rounded-md flex items-center justify-center transition-transform hover:scale-110 duration-200">
            <span className="text-primary-foreground font-bold text-xs">M</span>
          </div>
          <span className="font-bold text-sm tracking-tight">MNNote</span>
        </div>
        <div
          onClick={collapse}
          role="button"
          className={cn(
            "h-6 w-6 text-muted-foreground rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600 absolute top-3 right-2 opacity-0 group-hover/sidebar:opacity-100 transition z-[100]",
            isMobile && "opacity-100"
          )}
        >
          <ChevronsLeft className="h-6 w-6" />
        </div>

        <div className="flex-1 overflow-x-hidden overflow-y-auto">
            <SearchCommand isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
            <div className="transition-transform hover:translate-x-1 duration-200">
              <Item
                label="Search"
                icon={Search}
                isSearch
                onClick={() => setSearchOpen(true)}
              />
            </div>
            <div className="transition-transform hover:translate-x-1 duration-200">
              <Item
                label="Settings"
                icon={Settings}
                onClick={() => router.push("/settings")}
              />
            </div>
            <div className="transition-transform hover:translate-x-1 duration-200">
              <Item
                onClick={handleCreate}
                label="New Page"
                icon={PlusCircle}
              />
            </div>

          
          <div className="mt-4">
            {/* Personal Notes Section */}
            <div className="px-3 py-2">
              <h3 className="text-xs font-semibold text-muted-foreground mb-1 ml-1">Personal Notes</h3>
              {getPaginatedPersonalDocs().map((document) => (
                <div key={document.id} className="transition-all hover:pl-1 duration-200">
                  <Item
                    id={document.id}
                    onClick={() => onRedirect(document.id)}
                    label={document.title}
                    icon={FileIcon}
                    documentIcon={document.icon}
                    active={params.documentId === document.id}
                    level={0}
                    onExpand={() => onExpand(document.id)}
                    expanded={expanded[document.id]}
                  />
                  {expanded[document.id] && (
                    <DocumentList
                      parentDocumentId={document.id}
                      level={1}
                    />
                  )}
                </div>
              ))}
              
              {/* Personal Pagination Controls */}
              {personalDocs.length > 5 && personalLimit <= 5 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={showMorePersonal}
                  className="w-full text-xs text-muted-foreground h-6 mt-1 hover:bg-primary/5 transition-colors"
                >
                  Show More
                </Button>
              )}
              
              {personalLimit > 5 && personalDocs.length > 15 && (
                <div className="flex items-center justify-between px-2 mt-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 hover:scale-110 transition-transform"
                    onClick={prevPersonalPage}
                    disabled={personalPage === 0}
                  >
                    <ChevronLeft className="h-3 w-3" />
                  </Button>
                  <span className="text-[10px] text-muted-foreground">
                    {personalPage + 1} / {Math.ceil(personalDocs.length / 15)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 hover:scale-110 transition-transform"
                    onClick={nextPersonalPage}
                    disabled={(personalPage + 1) * 15 >= personalDocs.length}
                  >
                    <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>

            {/* Shared Notes Section */}
            {sharedDocs.length > 0 && (
              <div className="px-3 py-2 mt-2">
                <h3 className="text-xs font-semibold text-muted-foreground mb-1 ml-1">Shared with me</h3>
                {getPaginatedSharedDocs().map((document) => (
                  <div key={document.id} className="transition-all hover:pl-1 duration-200">
                    <Item
                      id={document.id}
                      onClick={() => onRedirect(document.id)}
                      label={document.title}
                      icon={FileIcon}
                      documentIcon={document.icon}
                      active={params.documentId === document.id}
                      level={0}
                      onExpand={() => onExpand(document.id)}
                      expanded={expanded[document.id]}
                      isShared={true}
                    />
                    {expanded[document.id] && (
                      <DocumentList
                        parentDocumentId={document.id}
                        level={1}
                      />
                    )}
                  </div>
                ))}

                {/* Shared Pagination Controls */}
                {sharedDocs.length > 3 && (
                  <div className="flex items-center justify-between px-2 mt-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 hover:scale-110 transition-transform"
                      onClick={prevSharedPage}
                      disabled={sharedPage === 0}
                    >
                      <ChevronLeft className="h-3 w-3" />
                    </Button>
                    <span className="text-[10px] text-muted-foreground">
                      {sharedPage + 1} / {Math.ceil(sharedDocs.length / 3)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 hover:scale-110 transition-transform"
                      onClick={nextSharedPage}
                      disabled={(sharedPage + 1) * 3 >= sharedDocs.length}
                    >
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            )}

            <div className="transition-transform hover:translate-x-1 duration-200">
              <Item
                onClick={handleCreate}
                icon={Plus}
                label="Add a page"
              />
            </div>
            {isMounted && (
              <Popover>
                <PopoverTrigger className="w-full mt-4">
                  <div className="transition-transform hover:translate-x-1 duration-200">
                    <Item label="Trash" icon={Trash} />
                  </div>
                </PopoverTrigger>
                <PopoverContent
                  className="p-0 w-72"
                  side={isMobile ? "bottom" : "right"}
                >
                  <TrashBox 
                    documents={trashDocuments} 
                    setDocuments={setTrashDocuments}
                    onRefresh={refreshSidebar}
                  />
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>
        
        {/* User Item at Bottom */}
        <div className="mt-auto">
          {isMounted && <UserItem />}
          <SidebarBreadcrumbs />
        </div>

        <div
          onMouseDown={handleMouseDown}
          onClick={resetWidth}
          className="opacity-0 group-hover/sidebar:opacity-100 transition cursor-ew-resize absolute h-full w-1 bg-primary/10 right-0 top-0"
        />
      </aside>
      <div
        ref={navbarRef}
        className={cn(
          "absolute top-0 z-[99999] left-60 w-[calc(100%-240px)] transition-all duration-300 ease-in-out",
          isResetting && "transition-all ease-in-out duration-300",
          isMobile && "left-0 w-full",
          isScrolled && "opacity-0 pointer-events-none",
          "pointer-events-none"
        )}    
      >
        <nav className="bg-transparent px-3 py-2 w-full">
          {isCollapsed && (
            <div className="flex items-center gap-x-2 pointer-events-auto">
              <MenuIcon
                onClick={resetWidth}
                role="button"
                className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors"
              />
              <div className="h-6 w-6 bg-primary rounded-md flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">M</span>
              </div>
            </div>
          )}
        </nav>
      </div>
    </>
  );
};
