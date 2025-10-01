import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, Plus, Edit3, Trash2, LogIn, LogOut, User, BookOpen, Tag, Folder, Save, Image as ImageIcon, Upload, Lock } from 'lucide-react';

// Mock data for blog posts with images
const mockPosts = [
    {
        id: 1,
        title: "Building Consistent Habits for Success",
        excerpt: "Discover the science behind habit formation and practical strategies to build lasting routines that drive personal growth.",
        content: "Habit formation is a cornerstone of personal development. By understanding the habit loop—cue, routine, reward—we can intentionally design behaviors that support our goals...\n![Habit Loop](https://placehold.co/600x400/2d3748/ffffff?text=Habit+Loop+Diagram)\nThis visual representation helps understand the cycle...",
        category: "Productivity",
        date: "2024-01-15",
        readTime: "5 min read"
    },
    {
        id: 2,
        title: "Mindfulness Meditation for Beginners",
        excerpt: "Learn how to start a mindfulness practice that reduces stress and enhances focus in your daily life.",
        content: "Mindfulness meditation involves paying attention to the present moment without judgment. This practice has been shown to reduce anxiety, improve concentration, and increase emotional regulation...\n![Meditation](https://placehold.co/600x300/2d3748/ffffff?text=Meditation+Posture)\nProper posture is essential for effective meditation...",
        category: "Mental Health",
        date: "2024-01-10",
        readTime: "7 min read"
    },
    {
        id: 3,
        title: "Goal Setting Frameworks That Actually Work",
        excerpt: "Explore proven goal-setting methodologies like SMART goals and OKRs to achieve your personal and professional objectives.",
        content: "Effective goal setting requires more than just writing down what you want to accomplish. Frameworks like SMART (Specific, Measurable, Achievable, Relevant, Time-bound) provide structure...",
        category: "Productivity",
        date: "2024-01-05",
        readTime: "6 min read"
    }
];

const initialCategories = ["Productivity", "Mental Health", "Self-Reflection", "Learning", "Career"];

export default function App() {
    const [posts, setPosts] = useState(mockPosts);
    const [filteredPosts, setFilteredPosts] = useState(mockPosts);
    const [categories, setCategories] = useState(initialCategories);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [currentView, setCurrentView] = useState("home");
    const [currentPost, setCurrentPost] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [showLogin, setShowLogin] = useState(false);
    const [loginPassword, setLoginPassword] = useState("");
    const [editPost, setEditPost] = useState(null);
    const [newPost, setNewPost] = useState({
        title: "",
        excerpt: "",
        content: "",
        category: "Productivity",
        date: new Date().toISOString().split('T')[0]
    });
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [newCategory, setNewCategory] = useState("");
    const [editingCategory, setEditingCategory] = useState(null);
    const [editCategoryName, setEditCategoryName] = useState("");
    const [imagePreview, setImagePreview] = useState(null);
    const contentRef = useRef(null);

    // Admin password (for demo purposes)
    const ADMIN_PASSWORD = "admin0321";

    // Filter posts by category
    useEffect(() => {
        if (selectedCategory === "All") {
            setFilteredPosts(posts);
        } else {
            setFilteredPosts(posts.filter(post => post.category === selectedCategory));
        }
    }, [selectedCategory, posts]);

    // Update new post category when categories change
    useEffect(() => {
        if (!categories.includes(newPost.category)) {
            setNewPost(prev => ({ ...prev, category: categories[0] || "Uncategorized" }));
        }
    }, [categories, newPost.category]);

    // Handle paste events for images in content editor
    useEffect(() => {
        const handlePaste = (e) => {
            if (currentView === "editor" && contentRef.current) {
                const items = e.clipboardData?.items;
                if (items) {
                    for (let i = 0; i < items.length; i++) {
                        if (items[i].type.indexOf("image") !== -1) {
                            e.preventDefault();
                            const blob = items[i].getAsFile();
                            const reader = new FileReader();
                            reader.onload = (event) => {
                                const imgMarkdown = `\n![Image](image/png;base64,${event.target.result.split(',')[1]})\n`;
                                const textarea = contentRef.current;
                                const startPos = textarea.selectionStart;
                                const endPos = textarea.selectionEnd;
                                const newValue = 
                                    textarea.value.substring(0, startPos) + 
                                    imgMarkdown + 
                                    textarea.value.substring(endPos);
                                if (editPost) {
                                    setEditPost({ ...editPost, content: newValue });
                                } else {
                                    setNewPost({ ...newPost, content: newValue });
                                }
                            };
                            reader.readAsDataURL(blob);
                            break;
                        }
                    }
                }
            }
        };
        document.addEventListener('paste', handlePaste);
        return () => document.removeEventListener('paste', handlePaste);
    }, [currentView, editPost, newPost]);

    const handleLogin = () => {
        if (loginPassword === ADMIN_PASSWORD) {
            setIsAdmin(true);
            setShowLogin(false);
            setLoginPassword("");
        } else {
            alert("Invalid password");
        }
    };

    const handleLogout = () => {
        setIsAdmin(false);
        setCurrentView("home");
    };

    const handleViewPost = (post) => {
        setCurrentPost(post);
        setCurrentView("post");
    };

    const handleEditPost = (post) => {
        setEditPost(post);
        setCurrentView("editor");
    };

    const handleDeletePost = (id) => {
        setPosts(posts.filter(post => post.id !== id));
        if (currentView === "post" && currentPost.id === id) {
            setCurrentView("home");
        }
    };

    const handleSavePost = () => {
        if (editPost) {
            setPosts(posts.map(post => post.id === editPost.id ? editPost : post));
            setEditPost(null);
            setCurrentView("home");
        } else {
            const newPostObj = {
                ...newPost,
                id: posts.length > 0 ? Math.max(...posts.map(p => p.id)) + 1 : 1,
                readTime: "New post"
            };
            setPosts([newPostObj, ...posts]);
            setNewPost({
                title: "",
                excerpt: "",
                content: "",
                category: categories[0] || "Uncategorized",
                date: new Date().toISOString().split('T')[0]
            });
            setCurrentView("home");
        }
    };

    const addCategory = () => {
        if (newCategory.trim() && !categories.includes(newCategory.trim())) {
            setCategories([...categories, newCategory.trim()]);
            setNewCategory("");
        }
    };

    const startEditCategory = (category) => {
        setEditingCategory(category);
        setEditCategoryName(category);
    };

    const saveEditCategory = () => {
        if (editCategoryName.trim() && editCategoryName.trim() !== editingCategory) {
            setPosts(posts.map(post => 
                post.category === editingCategory ? { ...post, category: editCategoryName.trim() } : post
            ));
            setCategories(categories.map(cat => 
                cat === editingCategory ? editCategoryName.trim() : cat
            ));
        }
        setEditingCategory(null);
        setEditCategoryName("");
    };

    const deleteCategory = (categoryToDelete) => {
        if (window.confirm(`Delete category "${categoryToDelete}"? All posts in this category will be moved to "Uncategorized".`)) {
            setPosts(posts.map(post => 
                post.category === categoryToDelete ? { ...post, category: "Uncategorized" } : post
            ));
            setCategories(categories.filter(cat => cat !== categoryToDelete));
            if (!categories.includes("Uncategorized") && categoryToDelete !== "Uncategorized") {
                setCategories(prev => [...prev, "Uncategorized"]);
            }
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const imgMarkdown = `\n![${file.name}](image/png;base64,${event.target.result.split(',')[1]})\n`;
                const currentContent = editPost ? editPost.content : newPost.content;
                const updatedContent = currentContent + imgMarkdown;
                if (editPost) {
                    setEditPost({ ...editPost, content: updatedContent });
                } else {
                    setNewPost({ ...newPost, content: updatedContent });
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const renderHome = () => (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">Self Development Journal</h1>
                <p className="text-gray-300 text-lg">Thoughts, insights, and strategies for personal growth</p>
            </div>
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 mb-8">
                <button
                    onClick={() => setSelectedCategory("All")}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all transform hover:scale-105 ${
                        selectedCategory === "All"
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                            : 'bg-gray-800 text-gray-300 hover:bg-gradient-to-r hover:from-purple-700 hover:to-pink-700'
                    }`}
                >
                    All
                </button>
                {categories.map(category => (
                    <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all transform hover:scale-105 ${
                            selectedCategory === category
                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                                : 'bg-gray-800 text-gray-300 hover:bg-gradient-to-r hover:from-purple-700 hover:to-pink-700'
                        }`}
                    >
                        {category}
                    </button>
                ))}
            </div>
            {/* Posts Grid */}
            <div className="space-y-6">
                {filteredPosts.map(post => (
                    <article
                        key={post.id}
                        className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 hover:from-purple-900 hover:to-pink-900 transition-all transform hover:scale-[1.02] cursor-pointer border border-gray-700 shadow-lg"
                        onClick={() => handleViewPost(post)}
                    >
                        <div className="flex justify-between items-start mb-3">
                            <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs px-3 py-1 rounded-full">
                                {post.category}
                            </span>
                            <span className="text-gray-400 text-sm">{post.date}</span>
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">{post.title}</h2>
                        <p className="text-gray-300 mb-4">{post.excerpt}</p>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400 text-sm">{post.readTime}</span>
                            {isAdmin && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleEditPost(post);
                                        }}
                                        className="text-gray-400 hover:text-purple-400 transition-colors"
                                    >
                                        <Edit3 size={16} />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeletePost(post.id);
                                        }}
                                        className="text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );

    const renderPost = () => (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <button
                onClick={() => setCurrentView("home")}
                className="flex items-center text-gray-400 hover:text-purple-400 mb-6 transition-colors"
            >
                <span className="mr-2">←</span> Back to Blog
            </button>
            <article className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-8 border border-gray-700 shadow-lg prose prose-invert max-w-none">
                <div className="flex justify-between items-start mb-4">
                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs px-3 py-1 rounded-full">
                        {currentPost.category}
                    </span>
                    <span className="text-gray-400">{currentPost.date}</span>
                </div>
                <h1 className="text-3xl font-bold text-white mb-4">{currentPost.title}</h1>
                <p className="text-gray-300 mb-6">{currentPost.excerpt}</p>
                <div 
                    className="text-gray-300 whitespace-pre-line"
                    dangerouslySetInnerHTML={{ 
                        __html: currentPost.content
                            .split('\n')
                            .map(line => {
                                // Convert markdown images to HTML
                                const imgRegex = /!\[([^\]]*)\]\(([^)]+)\)/;
                                const match = line.match(imgRegex);
                                if (match) {
                                    return `<img src="${match[2]}" alt="${match[1]}" class="w-full rounded-lg my-4 border border-gray-600" />`;
                                }
                                return line;
                            })
                            .join('<br />')
                    }}
                />
                {isAdmin && (
                    <div className="mt-8 flex gap-3">
                        <button
                            onClick={() => handleEditPost(currentPost)}
                            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg transition-all transform hover:scale-105"
                        >
                            <Edit3 size={16} /> Edit Post
                        </button>
                        <button
                            onClick={() => handleDeletePost(currentPost.id)}
                            className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 py-2 rounded-lg transition-all transform hover:scale-105"
                        >
                            <Trash2 size={16} /> Delete Post
                        </button>
                    </div>
                )}
            </article>
        </div>
    );

    const renderEditor = () => {
        const postToEdit = editPost || newPost;
        const setPostField = (field, value) => {
            if (editPost) {
                setEditPost({ ...editPost, [field]: value });
            } else {
                setNewPost({ ...newPost, [field]: value });
            }
        };
        return (
            <div className="max-w-3xl mx-auto px-4 py-8">
                <button
                    onClick={() => {
                        setCurrentView("home");
                        setEditPost(null);
                    }}
                    className="flex items-center text-gray-400 hover:text-purple-400 mb-6 transition-colors"
                >
                    <span className="mr-2">←</span> Back to Blog
                </button>
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 shadow-lg">
                    <h2 className="text-2xl font-bold text-white mb-6">
                        {editPost ? "Edit Post" : "Create New Post"}
                    </h2>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-gray-300 mb-2">Title</label>
                            <input
                                type="text"
                                value={postToEdit.title}
                                onChange={(e) => setPostField('title', e.target.value)}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="Enter post title"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-300 mb-2">Excerpt</label>
                            <textarea
                                value={postToEdit.excerpt}
                                onChange={(e) => setPostField('excerpt', e.target.value)}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                rows="3"
                                placeholder="Brief summary of your post"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-300 mb-2">Content</label>
                            <div className="mb-2 text-sm text-gray-400">
                                Paste images directly or use the upload button below
                            </div>
                            <textarea
                                ref={contentRef}
                                value={postToEdit.content}
                                onChange={(e) => setPostField('content', e.target.value)}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[300px]"
                                placeholder="Write your full post content here... You can paste images directly!"
                            />
                            <div className="mt-2">
                                <label className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-3 py-2 rounded-lg cursor-pointer transition-all transform hover:scale-105">
                                    <Upload size={16} />
                                    Upload Image
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                </label>
                                <p className="text-xs text-gray-400 mt-1">
                                    Supported formats: JPG, PNG, GIF
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-gray-300 mb-2">Category</label>
                                <select
                                    value={postToEdit.category}
                                    onChange={(e) => setPostField('category', e.target.value)}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-gray-300 mb-2">Date</label>
                                <input
                                    type="date"
                                    value={postToEdit.date}
                                    onChange={(e) => setPostField('date', e.target.value)}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                onClick={() => {
                                    setCurrentView("home");
                                    setEditPost(null);
                                }}
                                className="px-6 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSavePost}
                                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-all transform hover:scale-105"
                            >
                                {editPost ? "Update Post" : "Publish Post"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderCategoriesPanel = () => (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 shadow-lg">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Manage Categories</h2>
                    <button
                        onClick={() => setCurrentView("admin")}
                        className="text-gray-400 hover:text-purple-400 transition-colors"
                    >
                        ← Back to Dashboard
                    </button>
                </div>
                {/* Add New Category */}
                <div className="mb-8 p-4 bg-gradient-to-r from-gray-700 to-gray-800 rounded-lg border border-gray-600">
                    <h3 className="text-lg font-semibold text-white mb-3">Add New Category</h3>
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addCategory()}
                            className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Enter new category name"
                        />
                        <button
                            onClick={addCategory}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg transition-all transform hover:scale-105 flex items-center gap-2"
                        >
                            <Plus size={16} /> Add
                        </button>
                    </div>
                </div>
                {/* Categories List */}
                <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Existing Categories ({categories.length})</h3>
                    <div className="space-y-3">
                        {categories.map(category => (
                            <div key={category} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-700 to-gray-800 rounded-lg border border-gray-600">
                                <div className="flex items-center gap-3">
                                    <Folder className="text-purple-400" size={18} />
                                    {editingCategory === category ? (
                                        <input
                                            type="text"
                                            value={editCategoryName}
                                            onChange={(e) => setEditCategoryName(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && saveEditCategory()}
                                            className="bg-gray-600 border border-gray-500 rounded px-2 py-1 text-white focus:outline-none"
                                            autoFocus
                                        />
                                    ) : (
                                        <span className="text-white font-medium">{category}</span>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    {editingCategory === category ? (
                                        <button
                                            onClick={saveEditCategory}
                                            className="text-green-400 hover:text-green-300 transition-colors"
                                        >
                                            <Save size={18} />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => startEditCategory(category)}
                                            className="text-gray-400 hover:text-purple-400 transition-colors"
                                        >
                                            <Edit3 size={18} />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => deleteCategory(category)}
                                        className="text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderAdminPanel = () => (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 mb-6 border border-gray-700 shadow-lg">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Admin Dashboard</h2>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors"
                    >
                        <LogOut size={18} /> Logout
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-4 border border-purple-500">
                        <div className="text-2xl font-bold text-white mb-2">{posts.length}</div>
                        <div className="text-purple-100">Total Posts</div>
                    </div>
                    <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg p-4 border border-blue-500">
                        <div className="text-2xl font-bold text-white mb-2">{categories.length}</div>
                        <div className="text-blue-100">Categories</div>
                    </div>
                    <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-lg p-4 border border-green-500">
                        <div className="text-2xl font-bold text-white mb-2">1</div>
                        <div className="text-green-100">Admin User</div>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                        onClick={() => setCurrentView("editor")}
                        className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg transition-all transform hover:scale-105"
                    >
                        <Plus size={20} /> Create New Post
                    </button>
                    <button
                        onClick={() => setCurrentView("categories")}
                        className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-3 rounded-lg transition-all transform hover:scale-105"
                    >
                        <Tag size={20} /> Manage Categories
                    </button>
                    <button
                        onClick={() => setCurrentView("home")}
                        className="flex items-center justify-center gap-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-6 py-3 rounded-lg transition-all transform hover:scale-105 border border-gray-500"
                    >
                        <BookOpen size={20} /> View Blog
                    </button>
                </div>
            </div>
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 shadow-lg">
                <h3 className="text-xl font-bold text-white mb-4">Recent Posts</h3>
                <div className="space-y-4">
                    {posts.slice(0, 5).map(post => (
                        <div key={post.id} className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-700 to-gray-800 rounded-lg border border-gray-600">
                            <div>
                                <h4 className="font-medium text-white">{post.title}</h4>
                                <p className="text-gray-400 text-sm">{post.category} • {post.date}</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEditPost(post)}
                                    className="text-gray-400 hover:text-purple-400 transition-colors"
                                >
                                    <Edit3 size={16} />
                                </button>
                                <button
                                    onClick={() => handleDeletePost(post.id)}
                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderLogin = () => (
        <div className="max-w-md mx-auto px-4 py-12">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-8 text-center border border-gray-700 shadow-lg">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Lock className="text-white" size={32} />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Admin Login</h2>
                <p className="text-gray-400 mb-6">Enter your admin credentials</p>
                <div className="space-y-4">
                    <input
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Password"
                    />
                    <button
                        onClick={handleLogin}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                    >
                        <LogIn size={20} /> Login
                    </button>
                    <p className="text-xs text-gray-500 mt-4">
                        nothing happends even though you login admin.
                    </p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100">
            {/* Header */}
            <header className="bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex justify-between items-center h-16">
                        <button
                            onClick={() => setCurrentView("home")}
                            className="text-xl font-bold text-white hover:text-purple-400 transition-colors"
                        >
                            Chorem Blog
                        </button>
                        <div className="hidden md:flex items-center gap-6">
                            {isAdmin ? (
                                <>
                                    <button
                                        onClick={() => setCurrentView("admin")}
                                        className="text-gray-300 hover:text-purple-400 transition-colors"
                                    >
                                        Dashboard
                                    </button>
                                    <button
                                        onClick={handleLogout}
                                        className="text-gray-300 hover:text-red-400 transition-colors flex items-center gap-1"
                                    >
                                        <LogOut size={16} /> Logout
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => setShowLogin(true)}
                                    className="text-gray-300 hover:text-purple-400 transition-colors flex items-center gap-1"
                                >
                                    <LogIn size={16} /> Admin
                                </button>
                            )}
                        </div>
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden text-gray-300 hover:text-purple-400 transition-colors"
                        >
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                    {/* Mobile Menu */}
                    {mobileMenuOpen && (
                        <div className="md:hidden py-4 border-t border-gray-700">
                            {isAdmin ? (
                                <>
                                    <button
                                        onClick={() => {
                                            setCurrentView("admin");
                                            setMobileMenuOpen(false);
                                        }}
                                        className="block w-full text-left py-2 text-gray-300 hover:text-purple-400 transition-colors"
                                    >
                                        Dashboard
                                    </button>
                                    <button
                                        onClick={() => {
                                            handleLogout();
                                            setMobileMenuOpen(false);
                                        }}
                                        className="block w-full text-left py-2 text-gray-300 hover:text-red-400 flex items-center gap-2 transition-colors"
                                    >
                                        <LogOut size={16} /> Logout
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => {
                                        setShowLogin(true);
                                        setMobileMenuOpen(false);
                                    }}
                                    className="block w-full text-left py-2 text-gray-300 hover:text-purple-400 flex items-center gap-2 transition-colors"
                                >
                                    <LogIn size={16} /> Admin
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </header>
            {/* Main Content */}
            <main className="py-8">
                {showLogin ? renderLogin() : 
                 currentView === "home" ? renderHome() :
                 currentView === "post" ? renderPost() :
                 currentView === "admin" ? renderAdminPanel() :
                 currentView === "editor" ? renderEditor() :
                 currentView === "categories" ? renderCategoriesPanel() :
                 renderHome()
                }
            </main>
            {/* Footer */}
            <footer className="bg-gradient-to-r from-gray-800 to-gray-900 border-t border-gray-700 py-8">
                <div className="max-w-6xl mx-auto px-4 text-center text-gray-400">
                    <p>© 2025 Chorem. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}