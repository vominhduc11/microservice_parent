
import { useState, useEffect, useMemo, useCallback, useReducer } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, Search, Edit, Trash2, Eye, ChevronLeft, ChevronRight, MoreVertical, Settings, AlertTriangle, X, Archive, RotateCcw, Trash, FileText, Home, Calendar, TrendingUp, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "@/hooks/use-toast";
import { blogApi } from "@/services/api";
import { uploadService } from "@/services/uploadService";
import { BlogCreateRequest, BlogFormData, BlogResponse, BlogCategory, BlogCategoryCreateRequest, BlogIntroductionItem, BlogImageData } from "@/types";
import { DescriptionEditor } from "./DescriptionEditor";
import { ImageUpload } from "./ImageUpload";
import { DEFAULT_ITEMS_PER_PAGE } from "@/constants/business";
import { useDebounce } from "@/hooks/useDebounce";

const mockBlogs: BlogResponse[] = [];

const ITEMS_PER_PAGE = DEFAULT_ITEMS_PER_PAGE;

// State management with useReducer for better organization
type BlogPageState = {
  blogs: BlogResponse[];
  allBlogs: BlogResponse[]; // All blogs for stats calculation
  deletedBlogs: BlogResponse[];
  categories: BlogCategory[];
  searchTerm: string;
  isDialogOpen: boolean;
  editingBlog: BlogResponse | null;
  currentPage: number;
  showAll: boolean;
  viewMode: 'active' | 'trash';
  initialLoading: boolean;
  searchLoading: boolean;
  loadingCategories: boolean;
  categoryDialogOpen: boolean;
  creatingCategory: boolean;
  showCreateCategoryForm: boolean;
  deletingCategoryId: number | null;
  confirmDeleteDialog: {
    open: boolean;
    categoryId: number;
    categoryName: string;
  };
  confirmDeleteBlogDialog: {
    open: boolean;
    blogId: number;
    blogTitle: string;
    isHardDelete: boolean;
  };
  error: { type: 'blogs' | 'categories' | 'general'; message: string } | null;
};

type BlogPageAction =
  | { type: 'SET_BLOGS'; payload: BlogResponse[] }
  | { type: 'SET_ALL_BLOGS'; payload: BlogResponse[] }
  | { type: 'SET_DELETED_BLOGS'; payload: BlogResponse[] }
  | { type: 'SET_CATEGORIES'; payload: BlogCategory[] }
  | { type: 'SET_SEARCH_TERM'; payload: string }
  | { type: 'SET_DIALOG_OPEN'; payload: boolean }
  | { type: 'SET_EDITING_BLOG'; payload: BlogResponse | null }
  | { type: 'SET_CURRENT_PAGE'; payload: number }
  | { type: 'SET_SHOW_ALL'; payload: boolean }
  | { type: 'SET_VIEW_MODE'; payload: 'active' | 'trash' }
  | { type: 'SET_INITIAL_LOADING'; payload: boolean }
  | { type: 'SET_SEARCH_LOADING'; payload: boolean }
  | { type: 'SET_LOADING_CATEGORIES'; payload: boolean }
  | { type: 'SET_CATEGORY_DIALOG_OPEN'; payload: boolean }
  | { type: 'SET_CREATING_CATEGORY'; payload: boolean }
  | { type: 'SET_SHOW_CREATE_CATEGORY_FORM'; payload: boolean }
  | { type: 'SET_DELETING_CATEGORY_ID'; payload: number | null }
  | { type: 'SET_CONFIRM_DELETE_DIALOG'; payload: { open: boolean; categoryId: number; categoryName: string } }
  | { type: 'SET_CONFIRM_DELETE_BLOG_DIALOG'; payload: { open: boolean; blogId: number; blogTitle: string; isHardDelete: boolean } }
  | { type: 'RESET_PAGINATION' }
  | { type: 'UPDATE_BLOG'; payload: { id: number; blog: BlogResponse } }
  | { type: 'ADD_BLOG'; payload: BlogResponse }
  | { type: 'DELETE_BLOG'; payload: number }
  | { type: 'RESTORE_BLOG'; payload: BlogResponse }
  | { type: 'HARD_DELETE_BLOG'; payload: number }
  | { type: 'SET_ERROR'; payload: { type: 'blogs' | 'categories' | 'general'; message: string } }
  | { type: 'CLEAR_ERROR' };

const initialState: BlogPageState = {
  blogs: mockBlogs,
  allBlogs: [],
  deletedBlogs: [],
  categories: [],
  searchTerm: "",
  isDialogOpen: false,
  editingBlog: null,
  currentPage: 1,
  showAll: false,
  viewMode: 'active',
  initialLoading: false,
  searchLoading: false,
  loadingCategories: false,
  categoryDialogOpen: false,
  creatingCategory: false,
  showCreateCategoryForm: false,
  deletingCategoryId: null,
  confirmDeleteDialog: { open: false, categoryId: 0, categoryName: '' },
  confirmDeleteBlogDialog: { open: false, blogId: 0, blogTitle: '', isHardDelete: false },
  error: null
};

function blogPageReducer(state: BlogPageState, action: BlogPageAction): BlogPageState {
  switch (action.type) {
    case 'SET_BLOGS':
      return { ...state, blogs: action.payload };
    case 'SET_ALL_BLOGS':
      return { ...state, allBlogs: action.payload };
    case 'SET_DELETED_BLOGS':
      return { ...state, deletedBlogs: action.payload };
    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload };
    case 'SET_SEARCH_TERM':
      return { ...state, searchTerm: action.payload, currentPage: 1 };
    case 'SET_DIALOG_OPEN':
      return { ...state, isDialogOpen: action.payload };
    case 'SET_EDITING_BLOG':
      return { ...state, editingBlog: action.payload };
    case 'SET_CURRENT_PAGE':
      return { ...state, currentPage: action.payload };
    case 'SET_SHOW_ALL':
      return { ...state, showAll: action.payload, currentPage: 1 };
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload, currentPage: 1, searchTerm: '' };
    case 'SET_INITIAL_LOADING':
      return { ...state, initialLoading: action.payload };
    case 'SET_SEARCH_LOADING':
      return { ...state, searchLoading: action.payload };
    case 'SET_LOADING_CATEGORIES':
      return { ...state, loadingCategories: action.payload };
    case 'SET_CATEGORY_DIALOG_OPEN':
      return { ...state, categoryDialogOpen: action.payload };
    case 'SET_CREATING_CATEGORY':
      return { ...state, creatingCategory: action.payload };
    case 'SET_SHOW_CREATE_CATEGORY_FORM':
      return { ...state, showCreateCategoryForm: action.payload };
    case 'SET_DELETING_CATEGORY_ID':
      return { ...state, deletingCategoryId: action.payload };
    case 'SET_CONFIRM_DELETE_DIALOG':
      return { ...state, confirmDeleteDialog: action.payload };
    case 'SET_CONFIRM_DELETE_BLOG_DIALOG':
      return { ...state, confirmDeleteBlogDialog: action.payload };
    case 'RESET_PAGINATION':
      return { ...state, currentPage: 1 };
    case 'UPDATE_BLOG':
      return {
        ...state,
        blogs: state.blogs.map(blog =>
          blog.id === action.payload.id ? action.payload.blog : blog
        )
      };
    case 'ADD_BLOG':
      return { ...state, blogs: [action.payload, ...state.blogs] };
    case 'DELETE_BLOG':
      return { ...state, blogs: state.blogs.filter(blog => blog.id !== action.payload) };
    case 'RESTORE_BLOG':
      return {
        ...state,
        blogs: [action.payload, ...state.blogs],
        deletedBlogs: state.deletedBlogs.filter(blog => blog.id !== action.payload.id)
      };
    case 'HARD_DELETE_BLOG':
      return { ...state, deletedBlogs: state.deletedBlogs.filter(blog => blog.id !== action.payload) };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

export function BlogsPage() {
  const [state, dispatch] = useReducer(blogPageReducer, initialState);

  const {
    blogs,
    allBlogs,
    deletedBlogs,
    categories,
    searchTerm,
    isDialogOpen,
    editingBlog,
    currentPage,
    showAll,
    viewMode,
    initialLoading,
    searchLoading,
    loadingCategories,
    categoryDialogOpen,
    creatingCategory,
    showCreateCategoryForm,
    deletingCategoryId,
    confirmDeleteDialog,
    confirmDeleteBlogDialog,
    error
  } = state;

  // Debounce search term to avoid excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Enhanced error handling with retry capabilities
  const retryOperation = useCallback(async (operation: () => Promise<void>, operationType: 'blogs' | 'categories' | 'general') => {
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      try {
        await operation();
        dispatch({ type: 'CLEAR_ERROR' });
        return;
      } catch (error: any) {
        retryCount++;
        console.error(`Attempt ${retryCount} failed:`, error);

        if (retryCount >= maxRetries) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          dispatch({ type: 'SET_ERROR', payload: { type: operationType, message: errorMessage } });

          toast({
            title: `Lỗi ${operationType === 'blogs' ? 'blogs' : operationType === 'categories' ? 'danh mục' : 'hệ thống'}`,
            description: `${errorMessage}. Đã thử lại ${maxRetries} lần.`,
            variant: "destructive"
          });
          throw error;
        } else {
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        }
      }
    }
  }, [toast]);

  const form = useForm<BlogFormData>({
    defaultValues: {
      image: { url: "", public_id: "" },
      title: "",
      description: "",
      introduction: [],
      showOnHomepage: false,
      categoryId: 1
    }
  });

  const categoryForm = useForm<BlogCategoryCreateRequest>({
    defaultValues: {
      name: ""
    }
  });

  // Helper function to delete files from server using public_id
  const deleteFileWrapper = async (data: string | BlogImageData): Promise<void> => {
    if (!data) return;

    try {
      let publicId: string;
      if (typeof data === 'string') {
        // Fallback: extract from URL if old format
        const success = await uploadService.deleteFile(data);
        console.log(success ? 'File deleted (URL method)' : 'Delete failed (URL method)');
        return;
      } else {
        // Use stored public_id directly
        publicId = data.public_id;
      }

      if (!publicId) {
        console.warn('No public_id found for deletion');
        return;
      }

      const response = await uploadService.deleteFile(publicId, 'image');
      if (response) {
        console.log('File deleted successfully using public_id:', publicId);
      } else {
        console.warn('File deletion failed:', publicId);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };




  const loadBlogs = useCallback(async (searchQuery: string = '', isSearch: boolean = false) => {
    // Use searchLoading for search operations, initialLoading for first load
    if (isSearch) {
      dispatch({ type: 'SET_SEARCH_LOADING', payload: true });
    } else {
      dispatch({ type: 'SET_INITIAL_LOADING', payload: true });
    }

    try {
      await retryOperation(async () => {
        if (viewMode === 'active') {
          // Use search API if query exists, otherwise get all
          const response = searchQuery.trim()
            ? await blogApi.search(searchQuery, categories)
            : await blogApi.getAll(categories);
          dispatch({ type: 'SET_BLOGS', payload: response.data || [] });

          // Save all blogs for stats calculation only when NOT searching
          if (!isSearch || !searchQuery.trim()) {
            dispatch({ type: 'SET_ALL_BLOGS', payload: response.data || [] });
          }
        } else {
          const response = await blogApi.getDeleted(categories);
          dispatch({ type: 'SET_DELETED_BLOGS', payload: response.data || [] });
        }
      }, 'blogs');
    } catch (error) {
      // Error already handled by retryOperation
    } finally {
      if (isSearch) {
        dispatch({ type: 'SET_SEARCH_LOADING', payload: false });
      } else {
        dispatch({ type: 'SET_INITIAL_LOADING', payload: false });
      }
    }
  }, [retryOperation, categories, viewMode]);

  const loadCategories = useCallback(async () => {
    dispatch({ type: 'SET_LOADING_CATEGORIES', payload: true });

    try {
      await retryOperation(async () => {
        const response = await blogApi.getCategories();
        dispatch({ type: 'SET_CATEGORIES', payload: response.data || [] });
      }, 'categories');
    } catch (error) {
      // Error already handled by retryOperation
    } finally {
      dispatch({ type: 'SET_LOADING_CATEGORIES', payload: false });
    }
  }, [retryOperation]);

  // Manual refresh handler for user-triggered data sync
  const handleRefreshData = useCallback(async () => {
    dispatch({ type: 'SET_IS_LOADING', payload: true });
    dispatch({ type: 'SET_LOADING_CATEGORIES', payload: true });

    try {
      await Promise.allSettled([loadBlogs(), loadCategories()]);
      toast({
        title: "Đã làm mới dữ liệu",
        description: "Dữ liệu blogs và danh mục đã được cập nhật",
      });
    } catch (error) {
      console.error('Failed to refresh data:', error);
      dispatch({ type: 'SET_ERROR', payload: { type: 'general', message: 'Không thể làm mới dữ liệu' } });
      toast({
        title: "Lỗi làm mới",
        description: "Không thể làm mới dữ liệu. Vui lòng thử lại.",
        variant: "destructive"
      });
    }
  }, [loadBlogs, loadCategories, toast]);

  // Data synchronization: Initial load only
  useEffect(() => {
    const initializeData = async () => {
      // Load both blogs and categories simultaneously - only on component mount
      await Promise.allSettled([loadBlogs(), loadCategories()]);
    };

    initializeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // Intentionally empty - only run on mount, not when loadBlogs/loadCategories change
  }, []);

  // Refresh data when viewMode changes
  useEffect(() => {
    loadBlogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // viewMode is tracked in reducer, loadBlogs is stable
  }, [viewMode]);

  // Trigger search when debounced search term changes
  useEffect(() => {
    if (viewMode === 'active') {
      loadBlogs(debouncedSearchTerm, true); // isSearch = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // Only re-run when debouncedSearchTerm changes
  }, [debouncedSearchTerm]);

  // For deleted blogs view, we still use current data (no search API for deleted)
  const currentBlogs = viewMode === 'active' ? blogs : deletedBlogs;

  // For deleted blogs, apply frontend filter since there's no search API
  const filteredBlogs = useMemo(() => {
    if (viewMode === 'trash' && searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      return currentBlogs.filter(blog => {
        const titleMatch = blog.title.toLowerCase().includes(searchLower);
        const descriptionMatch = blog.description.toLowerCase().includes(searchLower);
        const introductionMatch = blog.introduction.some(item =>
          item.text?.toLowerCase().includes(searchLower)
        );
        return titleMatch || descriptionMatch || introductionMatch;
      });
    }
    return currentBlogs;
  }, [currentBlogs, searchTerm, viewMode]);

  // Pagination logic - memoized for performance
  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(filteredBlogs.length / ITEMS_PER_PAGE);
    const displayedBlogs = showAll
      ? filteredBlogs
      : filteredBlogs.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    return { totalPages, displayedBlogs };
  }, [filteredBlogs, currentPage, showAll]);

  const { totalPages, displayedBlogs } = paginationData;

  // Memoized statistics calculations - use allBlogs for consistent stats during search
  const blogStats = useMemo(() => {
    const statsBlogs = viewMode === 'active' && allBlogs.length > 0 ? allBlogs : blogs;
    const totalBlogs = statsBlogs.length;
    const homepageBlogs = statsBlogs.filter(b => b.showOnHomepage).length;
    const firstCategoryBlogs = categories.length > 0 ? statsBlogs.filter(b => b.categoryId === categories[0]?.id).length : 0;
    const thisMonthBlogs = statsBlogs.filter(b => new Date(b.createdAt).getMonth() === new Date().getMonth()).length;
    const firstCategoryName = categories.length > 0 ? categories[0]?.name || 'Danh mục' : 'Danh mục';

    return {
      totalBlogs,
      homepageBlogs,
      firstCategoryBlogs,
      thisMonthBlogs,
      firstCategoryName
    };
  }, [blogs, allBlogs, categories, viewMode]);

  // Memoized search handler to prevent unnecessary re-renders
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'SET_SEARCH_TERM', payload: e.target.value });
  }, []);

  // Memoized pagination handlers
  const handlePreviousPage = useCallback(() => {
    dispatch({ type: 'SET_CURRENT_PAGE', payload: Math.max(currentPage - 1, 1) });
  }, [currentPage]);

  const handleNextPage = useCallback(() => {
    dispatch({ type: 'SET_CURRENT_PAGE', payload: Math.min(currentPage + 1, totalPages) });
  }, [currentPage, totalPages]);

  const handleToggleShowAll = useCallback(() => {
    dispatch({ type: 'SET_SHOW_ALL', payload: !showAll });
  }, [showAll]);

  const handleAddBlog = useCallback(() => {
    dispatch({ type: 'SET_EDITING_BLOG', payload: null });
    form.reset();
    dispatch({ type: 'SET_DIALOG_OPEN', payload: true });
  }, [form]);

  const handleEditBlog = useCallback(async (blog: BlogResponse) => {
    try {
      dispatch({ type: 'SET_IS_LOADING', payload: true });
      dispatch({ type: 'SET_EDITING_BLOG', payload: blog });

      // Ensure categories are loaded first
      let availableCategories = categories;
      if (categories.length === 0) {
        // Fetch categories directly from API since state is not yet populated
        const categoriesResponse = await blogApi.getCategories();
        availableCategories = categoriesResponse.data || [];

        // Trigger background state update for future use
        loadCategories();
      }

      // Get fresh blog data from API with proper categories
      const response = await blogApi.getById(blog.id, availableCategories);
      const freshBlogData = response.data;

      // Debug category mapping
      console.log('=== EDIT BLOG DEBUG ===');
      console.log('Available categories for mapping:', availableCategories);
      console.log('API raw category:', response.data); // Show raw API response
      console.log('Transformed blog categoryId:', freshBlogData.categoryId);
      console.log('Categories mapping: "Tech News" should map to categoryId:', availableCategories.find(cat => cat.name === "Tech News")?.id);
      console.log('========================');

      // Convert image to object format for form
      let imageData;
      try {
        const parsedImage = JSON.parse(freshBlogData.image);
        imageData = {
          url: parsedImage.imageUrl,
          public_id: parsedImage.public_id
        };
      } catch {
        // Fallback if image is not JSON format
        imageData = typeof freshBlogData.image === 'string'
          ? { url: freshBlogData.image, public_id: '' }
          : freshBlogData.image;
      }

      form.reset({
        image: imageData,
        title: freshBlogData.title,
        description: freshBlogData.description,
        introduction: freshBlogData.introduction,
        showOnHomepage: freshBlogData.showOnHomepage,
        categoryId: freshBlogData.categoryId
      });

      dispatch({ type: 'SET_DIALOG_OPEN', payload: true });
    } catch (error) {
      console.error('Failed to load blog details:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin blog. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      dispatch({ type: 'SET_IS_LOADING', payload: false });
    }
  }, [form, toast, categories, loadCategories]);

  const handleDeleteBlog = useCallback((blog: BlogResponse) => {
    const isHardDelete = viewMode === 'trash';
    dispatch({ type: 'SET_CONFIRM_DELETE_BLOG_DIALOG', payload: {
      open: true,
      blogId: blog.id,
      blogTitle: blog.title,
      isHardDelete
    }});
  }, [viewMode]);

  const handleConfirmDeleteBlog = useCallback(async () => {
    try {
      const { blogId, isHardDelete } = confirmDeleteBlogDialog;
      await retryOperation(async () => {
        if (isHardDelete) {
          await blogApi.hardDelete(blogId);
          dispatch({ type: 'HARD_DELETE_BLOG', payload: blogId });
          toast({
            title: "Đã xóa vĩnh viễn",
            description: "Blog đã được xóa vĩnh viễn khỏi hệ thống",
          });
        } else {
          await blogApi.delete(blogId);
          dispatch({ type: 'DELETE_BLOG', payload: blogId });
          toast({
            title: "Đã chuyển vào thùng rác",
            description: "Blog đã được chuyển vào thùng rác",
          });

          // Refresh deleted blogs count after soft delete
          try {
            const deletedResponse = await blogApi.getDeleted(categories);
            dispatch({ type: 'SET_DELETED_BLOGS', payload: deletedResponse.data || [] });
          } catch (error) {
            console.error('Failed to refresh deleted blogs:', error);
          }
        }
        dispatch({ type: 'SET_CONFIRM_DELETE_BLOG_DIALOG', payload: { open: false, blogId: 0, blogTitle: '', isHardDelete: false }});
      }, 'general');
    } catch (error) {
      // Error already handled by retryOperation
    }
  }, [retryOperation, toast, confirmDeleteBlogDialog, categories]);

  const handleRestoreBlog = useCallback(async (blog: BlogResponse) => {
    try {
      await retryOperation(async () => {
        await blogApi.restore(blog.id);
        dispatch({ type: 'RESTORE_BLOG', payload: blog });
        toast({
          title: "Đã khôi phục blog",
          description: "Blog đã được khôi phục thành công",
        });

        // Refresh active blogs after restore to sync with server
        try {
          const activeResponse = await blogApi.getAll(categories);
          dispatch({ type: 'SET_BLOGS', payload: activeResponse.data || [] });
        } catch (error) {
          console.error('Failed to refresh active blogs:', error);
        }
      }, 'general');
    } catch (error) {
      // Error already handled by retryOperation
    }
  }, [retryOperation, toast, categories]);

  const getOnlyChangedBlogFields = (data: BlogFormData): Partial<BlogCreateRequest> => {
    const changedFields: Partial<BlogCreateRequest> = {};

    if (!editingBlog) {
      // For new blogs, return all fields
      const imageData = typeof data.image === 'string'
        ? { public_id: '', imageUrl: data.image }
        : { public_id: data.image?.public_id || '', imageUrl: data.image?.url || '' };

      return {
        ...data,
        image: JSON.stringify(imageData),
        introduction: JSON.stringify(data.introduction)
      };
    }

    // For editing, compare with original data
    if (data.title !== editingBlog.title) {
      changedFields.title = data.title;
    }

    if (data.description !== editingBlog.description) {
      changedFields.description = data.description;
    }

    if (data.showOnHomepage !== editingBlog.showOnHomepage) {
      changedFields.showOnHomepage = data.showOnHomepage;
    }

    if (data.categoryId !== editingBlog.categoryId) {
      changedFields.categoryId = data.categoryId;
    }

    // Check image changes
    const currentImageData = typeof data.image === 'string'
      ? { public_id: '', imageUrl: data.image }
      : { public_id: data.image?.public_id || '', imageUrl: data.image?.url || '' };

    const currentImageStr = JSON.stringify(currentImageData);
    if (currentImageStr !== editingBlog.image) {
      changedFields.image = currentImageStr;
    }

    // Check introduction changes
    const currentIntroStr = JSON.stringify(data.introduction);
    const originalIntroStr = JSON.stringify(editingBlog.introduction);
    if (currentIntroStr !== originalIntroStr) {
      changedFields.introduction = currentIntroStr;
    }

    return changedFields;
  };

  const onSubmit = useCallback(async (data: BlogFormData) => {
    try {
      dispatch({ type: 'SET_IS_LOADING', payload: true });

      const apiData = getOnlyChangedBlogFields(data);

      // Console log the body that would be sent to API
      console.log('=== BLOG FORM SUBMIT ===');
      console.log('Form Data:', data);
      console.log('API Body:', apiData);
      console.log('Changed Fields:', Object.keys(apiData));
      console.log('========================');

      if (editingBlog) {
        // Check if there are any changes
        if (Object.keys(apiData).length === 0) {
          toast({
            title: "Không có thay đổi",
            description: "Không có thông tin nào được thay đổi.",
          });
          dispatch({ type: 'SET_IS_LOADING', payload: false });
          return;
        }

        const response = await blogApi.update(editingBlog.id, apiData as BlogCreateRequest);
        dispatch({ type: 'UPDATE_BLOG', payload: { id: editingBlog.id, blog: response.data } });
        toast({
          title: "Đã cập nhật blog",
          description: "Blog đã được cập nhật thành công",
        });
      } else {
        const response = await blogApi.create(apiData as BlogCreateRequest);
        dispatch({ type: 'ADD_BLOG', payload: response.data });
        toast({
          title: "Đã thêm blog",
          description: "Blog mới đã được tạo thành công",
        });
      }

      dispatch({ type: 'SET_DIALOG_OPEN', payload: false });
      form.reset();

      // Refresh only blogs after successful operation
      try {
        await loadBlogs();
      } catch (error) {
        console.error('Failed to sync data after blog operation:', error);
      }
    } catch (error) {
      console.error('Failed to save blog:', error);
      toast({
        title: "Lỗi",
        description: `Không thể ${editingBlog ? 'cập nhật' : 'tạo'} blog. Vui lòng thử lại.`,
        variant: "destructive"
      });
    } finally {
      dispatch({ type: 'SET_IS_LOADING', payload: false });
    }
  }, [editingBlog, form, toast]);

  const onCreateCategory = useCallback(async (data: BlogCategoryCreateRequest) => {
    try {
      dispatch({ type: 'SET_CREATING_CATEGORY', payload: true });
      await blogApi.createCategory(data);
      toast({
        title: "Đã tạo danh mục",
        description: "Danh mục blog mới đã được tạo thành công",
      });
      dispatch({ type: 'SET_SHOW_CREATE_CATEGORY_FORM', payload: false });
      categoryForm.reset();
      // Reload categories and blogs after category creation
      try {
        await loadCategories();
        await loadBlogs(); // Reload blogs to get updated category mappings
      } catch (error) {
        console.error('Failed to sync data after category creation:', error);
      }
    } catch (error) {
      console.error('Failed to create category:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tạo danh mục. Vui lòng thử lại.",
        variant: "destructive"
      });
    } finally {
      dispatch({ type: 'SET_CREATING_CATEGORY', payload: false });
    }
  }, [categoryForm, toast, loadCategories]);

  const handleDeleteCategory = useCallback(async (id: number) => {
    try {
      dispatch({ type: 'SET_DELETING_CATEGORY_ID', payload: id });
      await blogApi.deleteCategory(id);
      toast({
        title: "Đã xóa danh mục",
        description: "Danh mục blog đã được xóa thành công",
      });
      dispatch({ type: 'SET_CONFIRM_DELETE_DIALOG', payload: { open: false, categoryId: 0, categoryName: '' } });
      // Reload categories and blogs after category deletion
      try {
        await loadCategories();
        await loadBlogs(); // Reload blogs to get updated category mappings
      } catch (error) {
        console.error('Failed to sync data after category deletion:', error);
      }
    } catch (error) {
      console.error('Failed to delete category:', error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa danh mục. Vui lòng thử lại.",
        variant: "destructive"
      });
    } finally {
      dispatch({ type: 'SET_DELETING_CATEGORY_ID', payload: null });
    }
  }, [toast, loadCategories, loadBlogs]);

  const openDeleteConfirmation = useCallback((category: BlogCategory) => {
    dispatch({ type: 'SET_CONFIRM_DELETE_DIALOG', payload: {
      open: true,
      categoryId: category.id,
      categoryName: category.name
    } });
  }, []);

  // Error display component - defined after all handlers to avoid dependency issues
  const ErrorBanner = useCallback(({ error, onDismiss }: { error: { type: string; message: string }; onDismiss: () => void }) => (
    <div className="bg-destructive/15 border border-destructive/30 rounded-lg p-4 mb-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
          <div>
            <h4 className="text-destructive font-medium">
              Lỗi {error.type === 'blogs' ? 'blogs' : error.type === 'categories' ? 'danh mục' : 'hệ thống'}
            </h4>
            <p className="text-destructive text-sm mt-1">{error.message}</p>
            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  onDismiss();
                  if (error.type === 'blogs') loadBlogs();
                  else if (error.type === 'categories') loadCategories();
                  else {
                    // Reload data based on error type
                    loadBlogs();
                    loadCategories();
                  }
                }}
                className="border-destructive/30 text-destructive hover:bg-destructive/10"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Thử lại
              </Button>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDismiss}
          className="text-destructive hover:bg-destructive/10"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  ), [loadBlogs, loadCategories]);


  return (
    <div className="space-y-8">
      {/* Error Banner */}
      {error && (
        <ErrorBanner
          error={error}
          onDismiss={() => dispatch({ type: 'CLEAR_ERROR' })}
        />
      )}

      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground truncate">Quản lý Blogs</h1>
            <p className="text-muted-foreground mt-1">Tạo và quản lý các bài viết blog</p>
          </div>
          <div className="flex gap-3 shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Quản lý
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => dispatch({ type: 'SET_CATEGORY_DIALOG_OPEN', payload: true })}>
                  <Settings className="h-4 w-4 mr-2" />
                  Quản lý danh mục
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {viewMode === 'active' && (
              <Button onClick={handleAddBlog} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Thêm Blog
              </Button>
            )}
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'active' ? 'default' : 'outline'}
            size="sm"
            onClick={() => dispatch({ type: 'SET_VIEW_MODE', payload: 'active' })}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            Blogs hoạt động ({allBlogs.length > 0 ? allBlogs.length : blogs.length})
          </Button>
          <Button
            variant={viewMode === 'trash' ? 'default' : 'outline'}
            size="sm"
            onClick={() => dispatch({ type: 'SET_VIEW_MODE', payload: 'trash' })}
            className="flex items-center gap-2"
          >
            <Archive className="h-4 w-4" />
            Thùng rác ({deletedBlogs.length})
          </Button>
        </div>
      </div>

      {/* Category Management Dialog */}
      <Dialog open={categoryDialogOpen} onOpenChange={(open) => dispatch({ type: 'SET_CATEGORY_DIALOG_OPEN', payload: open })}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>Quản lý danh mục blog</span>
                  <Button
                    onClick={() => dispatch({ type: 'SET_SHOW_CREATE_CATEGORY_FORM', payload: !showCreateCategoryForm })}
                    size="sm"
                    variant={showCreateCategoryForm ? "outline" : "default"}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {showCreateCategoryForm ? "Hủy" : "Thêm"}
                  </Button>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Create Category Form */}
                {showCreateCategoryForm && (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium mb-4">Tạo danh mục mới</h3>
                    <Form {...categoryForm}>
                      <form onSubmit={categoryForm.handleSubmit(onCreateCategory)} className="space-y-4">
                        <FormField
                          control={categoryForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tên danh mục</FormLabel>
                              <FormControl>
                                <Input placeholder="Nhập tên danh mục..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => dispatch({ type: 'SET_SHOW_CREATE_CATEGORY_FORM', payload: false })}
                            size="sm"
                          >
                            Hủy
                          </Button>
                          <Button
                            type="submit"
                            disabled={creatingCategory}
                            size="sm"
                          >
                            {creatingCategory ? "Đang tạo..." : "Tạo"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </div>
                )}

                {/* Categories List */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="font-medium text-foreground">Danh sách danh mục</h3>
                    <div className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded">
                      {categories.length}
                    </div>
                  </div>

                  {loadingCategories ? (
                    <div className="text-center py-8">
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                        <span className="text-sm text-muted-foreground">Đang tải...</span>
                      </div>
                    </div>
                  ) : categories.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">Chưa có danh mục nào</p>
                      <Button
                        onClick={() => dispatch({ type: 'SET_SHOW_CREATE_CATEGORY_FORM', payload: true })}
                        size="sm"
                        variant="outline"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Tạo danh mục đầu tiên
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {categories.map((category) => (
                        <div
                          key={category.id}
                          className="flex items-center justify-between p-3 border border-border rounded hover:bg-muted/50"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-foreground">{category.name}</div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteConfirmation(category)}
                            disabled={deletingCategoryId === category.id}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>

      {/* Delete Confirmation Dialog */}
          <Dialog open={confirmDeleteDialog.open} onOpenChange={(open) =>
            dispatch({ type: 'SET_CONFIRM_DELETE_DIALOG', payload: { ...confirmDeleteDialog, open } })
          }>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-red-600">
                  <Trash2 className="h-5 w-5" />
                  Xác nhận xóa danh mục
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Bạn có chắc chắn muốn xóa danh mục{" "}
                  <span className="font-semibold text-foreground">"{confirmDeleteDialog.categoryName}"</span>?
                </p>
                <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800/30 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <div className="text-yellow-600 dark:text-yellow-500 mt-0.5">⚠️</div>
                    <div className="text-sm text-yellow-800 dark:text-yellow-200">
                      <p className="font-medium mb-1">Lưu ý:</p>
                      <p>Hành động này không thể hoàn tác. Các blog thuộc danh mục này có thể bị ảnh hưởng.</p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => dispatch({ type: 'SET_CONFIRM_DELETE_DIALOG', payload: { ...confirmDeleteDialog, open: false } })}
                    disabled={deletingCategoryId === confirmDeleteDialog.categoryId}
                    className="min-w-[80px]"
                  >
                    Hủy
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDeleteCategory(confirmDeleteDialog.categoryId)}
                    disabled={deletingCategoryId === confirmDeleteDialog.categoryId}
                    className="min-w-[100px]"
                  >
                    {deletingCategoryId === confirmDeleteDialog.categoryId ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Đang xóa...
                      </div>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Xóa danh mục
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

      {/* Blog Delete Confirmation Dialog */}
      <Dialog open={confirmDeleteBlogDialog.open} onOpenChange={(open) =>
        dispatch({ type: 'SET_CONFIRM_DELETE_BLOG_DIALOG', payload: { ...confirmDeleteBlogDialog, open } })
      }>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              {confirmDeleteBlogDialog.isHardDelete ? (
                <>
                  <Trash className="h-5 w-5" />
                  Xác nhận xóa vĩnh viễn
                </>
              ) : (
                <>
                  <Archive className="h-5 w-5 text-yellow-600" />
                  <span className="text-yellow-600">Xác nhận chuyển vào thùng rác</span>
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              {confirmDeleteBlogDialog.isHardDelete
                ? 'Bạn có chắc chắn muốn xóa vĩnh viễn blog'
                : 'Bạn có chắc chắn muốn chuyển blog vào thùng rác'
              }{" "}
              <span className="font-semibold text-foreground">"{confirmDeleteBlogDialog.blogTitle}"</span>?
            </p>
            <div className={`${confirmDeleteBlogDialog.isHardDelete ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/30' : 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800/30'} border rounded-lg p-3`}>
              <div className="flex items-start gap-2">
                <div className={`${confirmDeleteBlogDialog.isHardDelete ? 'text-red-600 dark:text-red-500' : 'text-yellow-600 dark:text-yellow-500'} mt-0.5`}>⚠️</div>
                <div className={`text-sm ${confirmDeleteBlogDialog.isHardDelete ? 'text-red-800 dark:text-red-200' : 'text-yellow-800 dark:text-yellow-200'}`}>
                  <p className="font-medium mb-1">Lưu ý:</p>
                  <p>
                    {confirmDeleteBlogDialog.isHardDelete
                      ? 'Hành động này không thể hoàn tác. Blog sẽ bị xóa vĩnh viễn khỏi hệ thống.'
                      : 'Blog sẽ được chuyển vào thùng rác và có thể khôi phục sau này.'
                    }
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => dispatch({ type: 'SET_CONFIRM_DELETE_BLOG_DIALOG', payload: { ...confirmDeleteBlogDialog, open: false } })}
                disabled={initialLoading}
                className="min-w-[80px]"
              >
                Hủy
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDeleteBlog}
                disabled={initialLoading}
                className="min-w-[100px]"
              >
                {initialLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Đang xóa...
                  </div>
                ) : confirmDeleteBlogDialog.isHardDelete ? (
                  <>
                    <Trash className="h-4 w-4 mr-2" />
                    Xóa vĩnh viễn
                  </>
                ) : (
                  <>
                    <Archive className="h-4 w-4 mr-2" />
                    Chuyển vào thùng rác
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Blog Creation/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => dispatch({ type: 'SET_DIALOG_OPEN', payload: open })}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingBlog ? "Chỉnh sửa Blog" : "Thêm Blog mới"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tiêu đề</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập tiêu đề blog..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hình ảnh blog</FormLabel>
                      <FormControl>
                        <ImageUpload
                          value={field.value}
                          onChange={field.onChange}
                          onRemove={deleteFileWrapper}
                          placeholder="Chọn hoặc kéo thả hình ảnh cho blog"
                          maxSizeInMB={10}
                          previewSize="large"
                          folder="blogs"
                          useObjectFormat={true}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mô tả ngắn</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Nhập mô tả ngắn cho blog..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="introduction"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nội dung giới thiệu (JSON)</FormLabel>
                      <FormControl>
                        <DescriptionEditor
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Danh mục</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value?.toString()}
                          onValueChange={(value) => field.onChange(parseInt(value))}
                          disabled={loadingCategories}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={loadingCategories ? "Đang tải..." : "Chọn danh mục"} />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id.toString()}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="showOnHomepage"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Hiển thị trên trang chủ
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => dispatch({ type: 'SET_DIALOG_OPEN', payload: false })}>
                    Hủy
                  </Button>
                  <Button type="submit" disabled={initialLoading}>
                    {initialLoading ? "Đang xử lý..." : (editingBlog ? "Cập nhật" : "Thêm")}
                  </Button>
                </div>
              </form>
            </Form>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Tổng blogs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{blogStats.totalBlogs}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Home className="h-4 w-4" />
              Hiển thị trang chủ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-500">
              {blogStats.homepageBlogs}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Danh mục hàng đầu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-1">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-500">
                {blogStats.firstCategoryBlogs}
              </div>
              <div className="text-xs text-muted-foreground truncate">
                {blogStats.firstCategoryName}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Tháng này
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-500">
              {blogStats.thisMonthBlogs}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <CardTitle className="text-lg font-semibold">Danh sách Blogs</CardTitle>
            <div className="relative min-w-0 sm:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm blogs..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10 w-full"
              />
              {searchLoading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Desktop Table View */}
          <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Ảnh</TableHead>
                <TableHead>Tiêu đề</TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead>Danh mục</TableHead>
                <TableHead>Trang chủ</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span>Đang tải blogs...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : displayedBlogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {searchTerm ? 'Không tìm thấy blog nào phù hợp' : 'Chưa có blog nào'}
                  </TableCell>
                </TableRow>
              ) : (
                displayedBlogs.map((blog) => {
                  // Parse image URL from blog.image
                  let imageUrl = '';
                  try {
                    const imageData = JSON.parse(blog.image);
                    imageUrl = imageData.imageUrl || '';
                  } catch (e) {
                    imageUrl = typeof blog.image === 'string' ? blog.image : '';
                  }

                  return (
                  <TableRow key={blog.id}>
                    <TableCell>
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={blog.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div className={`${imageUrl ? 'hidden' : ''} text-muted-foreground`}>
                          <FileText className="h-5 w-5" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium max-w-xs">
                      <div className="truncate">{blog.title}</div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="text-sm text-muted-foreground line-clamp-2">
                        {blog.description || 'Không có mô tả'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {categories.find(c => c.id === blog.categoryId)?.name || `ID: ${blog.categoryId}`}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        blog.showOnHomepage
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {blog.showOnHomepage ? 'Có' : 'Không'}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">{new Date(blog.createdAt).toLocaleDateString('vi-VN')}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {viewMode === 'active' ? (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditBlog(blog)}
                              className="h-8 w-8"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteBlog(blog)}
                              className="h-8 w-8 text-yellow-600 hover:text-yellow-700"
                              title="Chuyển vào thùng rác"
                            >
                              <Archive className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRestoreBlog(blog)}
                              className="h-8 w-8 text-green-600 hover:text-green-700"
                              title="Khôi phục"
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteBlog(blog)}
                              className="h-8 w-8 text-red-600 hover:text-red-700"
                              title="Xóa vĩnh viễn"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
          </div>

          {/* Mobile Card View */}
          <div className="block md:hidden space-y-3 sm:space-y-4">
            {initialLoading ? (
              <div className="text-center py-8">
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span>Đang tải blogs...</span>
                </div>
              </div>
            ) : displayedBlogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? 'Không tìm thấy blog nào phù hợp' : 'Chưa có blog nào'}
              </div>
            ) : (
              displayedBlogs.map((blog) => {
                // Parse image URL from blog.image
                let imageUrl = '';
                try {
                  const imageData = JSON.parse(blog.image);
                  imageUrl = imageData.imageUrl || '';
                } catch (e) {
                  imageUrl = typeof blog.image === 'string' ? blog.image : '';
                }

                return (
                <Card key={blog.id} className="p-4">
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      {/* Image Thumbnail */}
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex items-center justify-center flex-shrink-0">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={blog.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div className={`${imageUrl ? 'hidden' : ''} text-muted-foreground`}>
                          <FileText className="h-6 w-6" />
                        </div>
                      </div>
                      {/* Title and Actions */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="font-medium text-foreground text-sm md:text-base line-clamp-2">{blog.title}</h3>
                          <div className="flex gap-1 flex-shrink-0">
                        {viewMode === 'active' ? (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditBlog(blog)}
                              className="h-8 w-8 flex-shrink-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteBlog(blog)}
                              className="h-8 w-8 text-yellow-600 hover:text-yellow-700 flex-shrink-0"
                              title="Chuyển vào thùng rác"
                            >
                              <Archive className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRestoreBlog(blog)}
                              className="h-8 w-8 text-green-600 hover:text-green-700 flex-shrink-0"
                              title="Khôi phục"
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteBlog(blog)}
                              className="h-8 w-8 text-red-600 hover:text-red-700 flex-shrink-0"
                              title="Xóa vĩnh viễn"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground line-clamp-2">
                      {blog.description || 'Không có mô tả'}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium">Danh mục:</span> {categories.find(c => c.id === blog.categoryId)?.name || `ID: ${blog.categoryId}`}
                      </div>
                      <div>
                        <span className="font-medium">Trang chủ:</span> {blog.showOnHomepage ? 'Có' : 'Không'}
                      </div>
                      <div className="col-span-2">
                        <span className="font-medium">Ngày tạo:</span> {new Date(blog.createdAt).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                  </div>
                </Card>
                );
              })
            )}
          </div>

          {/* Pagination */}
          {filteredBlogs.length > ITEMS_PER_PAGE && (
            <div className="flex items-center justify-between px-2 py-4">
              <div className="text-sm text-muted-foreground">
                {showAll ? (
                  `Hiển thị tất cả ${filteredBlogs.length} blogs`
                ) : (
                  `Hiển thị ${(currentPage - 1) * ITEMS_PER_PAGE + 1}-${Math.min(currentPage * ITEMS_PER_PAGE, filteredBlogs.length)} của ${filteredBlogs.length} blogs`
                )}
              </div>
              <div className="flex items-center space-x-2">
                {!showAll && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Trước
                    </Button>
                    <span className="text-sm">
                      Trang {currentPage} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                    >
                      Sau
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToggleShowAll}
                >
                  {showAll ? "Thu gọn" : "Xem tất cả"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
