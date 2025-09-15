'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Save, X, MessageSquare } from 'lucide-react'
import { Note } from '@/types'

interface NotesSectionProps {
  clientId: string
}

export default function NotesSection({ clientId }: NotesSectionProps) {
  const [notes, setNotes] = useState<Note[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddingNote, setIsAddingNote] = useState(false)
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [newNoteContent, setNewNoteContent] = useState('')
  const [editNoteContent, setEditNoteContent] = useState('')

  // Load notes when component mounts
  useEffect(() => {
    loadNotes()
  }, [clientId])

  const loadNotes = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/clients/${clientId}/notes`)
      if (response.ok) {
        const notesData = await response.json()
        // Convert date strings back to Date objects
        const processedNotes = notesData.map((note: any) => ({
          ...note,
          createdAt: new Date(note.createdAt),
          updatedAt: new Date(note.updatedAt)
        }))
        setNotes(processedNotes)
      } else {
        console.error('Failed to fetch notes')
      }
    } catch (error) {
      console.error('Error loading notes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddNote = async () => {
    if (!newNoteContent.trim()) return

    try {
      const response = await fetch(`/api/clients/${clientId}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: newNoteContent.trim() })
      })

      if (response.ok) {
        const newNote = await response.json()
        const processedNote = {
          ...newNote,
          createdAt: new Date(newNote.createdAt),
          updatedAt: new Date(newNote.updatedAt)
        }
        setNotes([processedNote, ...notes])
        setNewNoteContent('')
        setIsAddingNote(false)
      } else {
        console.error('Failed to create note')
      }
    } catch (error) {
      console.error('Error creating note:', error)
    }
  }

  const handleEditNote = async (noteId: string) => {
    if (!editNoteContent.trim()) return

    try {
      const response = await fetch(`/api/clients/${clientId}/notes/${noteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: editNoteContent.trim() })
      })

      if (response.ok) {
        const updatedNote = await response.json()
        const processedNote = {
          ...updatedNote,
          createdAt: new Date(updatedNote.createdAt),
          updatedAt: new Date(updatedNote.updatedAt)
        }
        setNotes(notes.map(note => 
          note.id === noteId ? processedNote : note
        ))
        setEditingNoteId(null)
        setEditNoteContent('')
      } else {
        console.error('Failed to update note')
      }
    } catch (error) {
      console.error('Error updating note:', error)
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return

    try {
      const response = await fetch(`/api/clients/${clientId}/notes/${noteId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setNotes(notes.filter(note => note.id !== noteId))
      } else {
        console.error('Failed to delete note')
      }
    } catch (error) {
      console.error('Error deleting note:', error)
    }
  }

  const startEditing = (note: Note) => {
    setEditingNoteId(note.id)
    setEditNoteContent(note.content)
  }

  const cancelEditing = () => {
    setEditingNoteId(null)
    setEditNoteContent('')
  }

  const cancelAdding = () => {
    setIsAddingNote(false)
    setNewNoteContent('')
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const formatRelativeDate = (date: Date) => {
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return 'Today'
    if (diffDays === 2) return 'Yesterday'
    if (diffDays <= 7) return `${diffDays - 1} days ago`
    return formatDate(date)
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 font-heading flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary-500" />
          Meeting Notes
          <span className="text-sm font-normal text-gray-500">({notes.length})</span>
        </h3>
        
        {!isAddingNote && (
          <button
            onClick={() => setIsAddingNote(true)}
            className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-3 py-2 rounded-lg text-sm transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Note
          </button>
        )}
      </div>

      {/* Add New Note Form */}
      {isAddingNote && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Meeting Note
            </label>
            <textarea
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              placeholder="Had a meeting today, fixed this issue, added this feature..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
              rows={4}
              autoFocus
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleAddNote}
              disabled={!newNoteContent.trim()}
              className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white px-3 py-2 rounded-lg text-sm transition-colors"
            >
              <Save className="h-4 w-4" />
              Save Note
            </button>
            <button
              onClick={cancelAdding}
              className="inline-flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-sm transition-colors"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Notes List */}
      {notes.length === 0 ? (
        <div className="text-center py-8">
          <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-2">No meeting notes yet</p>
          <p className="text-sm text-gray-400">
            Add notes after meetings to track progress and next steps
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notes.map((note) => (
            <div key={note.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-900">
                      {formatRelativeDate(note.createdAt)}
                    </span>
                    {note.updatedAt.getTime() !== note.createdAt.getTime() && (
                      <span className="text-xs text-gray-500">(edited)</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {formatDate(note.createdAt)}
                  </p>
                </div>
                
                {editingNoteId !== note.id && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => startEditing(note)}
                      className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                      title="Edit note"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Delete note"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
              
              {editingNoteId === note.id ? (
                <div className="space-y-3">
                  <textarea
                    value={editNoteContent}
                    onChange={(e) => setEditNoteContent(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                    rows={4}
                    autoFocus
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditNote(note.id)}
                      disabled={!editNoteContent.trim()}
                      className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white px-3 py-1.5 rounded text-sm transition-colors"
                    >
                      <Save className="h-3 w-3" />
                      Save
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="inline-flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-3 py-1.5 rounded text-sm transition-colors"
                    >
                      <X className="h-3 w-3" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {note.content}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
