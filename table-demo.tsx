"use client"

import { useState, useRef, useEffect } from "react"
import {
  User,
  ChevronDown,
  Lock,
  ArrowUp,
  ArrowDown,
  Calendar,
  Tag,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Pin,
  PinOff,
} from "lucide-react"

// TableHeaderCell component with menu
const TableHeaderCell = ({
  label = "User",
  onRename = () => {},
  columnIndex = 0,
  frozenColumns = 0,
  onFreeze = () => {},
  width = "240px",
  isFirstColumn = false,
  isActionColumn = false,
}) => {
  const [isFocused, setIsFocused] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [columnName, setColumnName] = useState(label)
  const [cellWidth, setCellWidth] = useState(0)
  const menuRef = useRef<HTMLDivElement>(null)
  const cellRef = useRef<HTMLButtonElement>(null)

  // Determine if this column is frozen
  const isFrozen = columnIndex <= frozenColumns

  // Determine if this is the last frozen column
  const isLastFrozenColumn = columnIndex === frozenColumns

  // Calculate left position for frozen columns
  const calculateLeftPosition = () => {
    if (!isFrozen) return "auto"

    // Calculate the sum of widths of all previous frozen columns
    let leftPosition = 0
    for (let i = 0; i < columnIndex; i++) {
      // Use the width of the previous columns
      const prevWidth = i === 0 ? 240 : 240 // First column is 240px, others are 240px
      leftPosition += prevWidth
    }
    return `${leftPosition}px`
  }

  // Get appropriate icon based on column label
  const getIcon = () => {
    switch (label.toLowerCase()) {
      case "user":
        return <User size={16} className="text-gray-600" />
      case "date":
        return <Calendar size={16} className="text-gray-600" />
      case "type":
        return <Tag size={16} className="text-gray-600" />
      case "actions":
        return <MoreHorizontal size={16} className="text-gray-600" />
      default:
        return <User size={16} className="text-gray-600" />
    }
  }

  // Update cell width measurement when the component mounts or when menu opens
  useEffect(() => {
    if (cellRef.current) {
      const width = cellRef.current.getBoundingClientRect().width
      setCellWidth(width)
    }
  }, [isMenuOpen])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        cellRef.current &&
        !cellRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Handle header cell actions
  const handleAction = (action: string) => {
    if (action === "freeze") {
      onFreeze(columnIndex)
    } else {
      console.log(`Action: ${action} for column ${columnName}`)
    }
    setIsMenuOpen(false)
  }

  // Handle column rename
  const handleRename = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const target = e.target as HTMLFormElement;
    const newName = (target.elements.namedItem('columnName') as HTMLInputElement).value;
    setColumnName(newName)
    onRename(newName)
    setIsMenuOpen(false)
  }

  // For action column, use a different style and don't allow menu
  if (isActionColumn) {
    return (
      <div
        className="relative"
        style={{
          position: isFrozen ? "sticky" : "relative",
          left: calculateLeftPosition(),
          zIndex: isFrozen ? 10 : "auto",
          borderRight: isLastFrozenColumn ? "2px solid #E6E6E6" : "none",
          minWidth: "60px",
          width: "60px",
          top: 0,
        }}
      >
        <div
          className="flex py-3 px-4 items-center justify-center gap-2 w-full self-stretch border-b border-gray-200 relative"
          style={{
            background: "#F9F9F9",
            height: "40px", // Fixed height for all header cells
          }}
        >
          <span
            className="text-gray-600 text-xs font-medium leading-4"
            style={{ fontFamily: "var(--font-family-Volte, Volte)" }}
          >
            {columnName}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div
      className="relative"
      style={{
        position: isFrozen ? "sticky" : "relative",
        left: calculateLeftPosition(),
        zIndex: isFrozen ? 10 : "auto",
        borderRight: isLastFrozenColumn ? "2px solid #E6E6E6" : "none",
        minWidth: isFirstColumn ? "240px" : width,
        width: isFirstColumn ? "auto" : width,
        flex: isFirstColumn ? "1 0 240px" : "0 0 auto",
        top: 0,
      }}
    >
      {/* Header Cell */}
      <button
        ref={cellRef}
        className="flex py-3 px-4 items-center gap-2 w-full self-stretch border-b border-gray-200 relative"
        style={{
          background: isHovered ? "#F2F2F2" : "#F9F9F9",
          outline: isFocused ? "2px solid #1077D6" : "none",
          outlineOffset: "-2px",
          transition: "background-color 0.2s ease-in-out",
          height: "40px", // Fixed height for all header cells
        }}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {getIcon()}
        <span
          className="text-gray-600 text-xs font-medium leading-4"
          style={{ fontFamily: "var(--font-family-Volte, Volte)" }}
        >
          {columnName}
        </span>
        {isLastFrozenColumn && frozenColumns >= 0 && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <button
              onClick={(e) => {
                e.stopPropagation() // Prevent opening the dropdown menu
                e.preventDefault() // Prevent focus on the parent
                onFreeze(columnIndex)
              }}
              onMouseDown={(e) => {
                // Prevent focus on the parent button
                e.preventDefault()
              }}
              className="p-1 rounded-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              title="Unfreeze columns"
            >
              <Lock size={12} className="text-gray-600" />
            </button>
          </div>
        )}
      </button>

      {/* Column Menu */}
      {isMenuOpen && (
        <div
          ref={menuRef}
          className="fixed z-50"
          style={{
            boxShadow: "0px 4px 24px rgba(0, 0, 0, 0.10)",
            borderRadius: "8px",
            width: `${cellWidth}px`,
            left: cellRef.current?.getBoundingClientRect().left,
            top: cellRef.current?.getBoundingClientRect().bottom + window.scrollY,
          }}
        >
          <div className="bg-white rounded-lg py-2 px-1">
            {/* Search input field for rename */}
            <form onSubmit={handleRename} className="px-4 py-2.5">
              <div className="flex w-full rounded-lg border border-gray-200 bg-white">
                <input
                  name="columnName"
                  type="text"
                  placeholder="Name"
                  defaultValue={columnName}
                  className="flex-1 px-2 py-1 text-sm text-gray-600 outline-none"
                  style={{
                    fontFamily: "Volte",
                    fontSize: "14px",
                    fontWeight: "400",
                    lineHeight: "20px",
                    color: "#4D4D4D",
                  }}
                />
              </div>
            </form>

            {/* Divider */}
            <div className="h-px w-full bg-gray-200 my-1"></div>

            {/* Menu items */}
            <button
              className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg hover:bg-gray-50 text-left"
              onClick={() => handleAction("freeze")}
              style={{
                background: isFrozen ? "rgba(16, 119, 214, 0.08)" : "white",
              }}
            >
              <Lock size={20} className={isFrozen ? "text-blue-600" : "text-gray-900"} />
              <span
                style={{
                  color: isFrozen ? "#1077D6" : "#202020",
                  fontSize: "14px",
                  fontFamily: "Volte",
                  fontWeight: "500",
                  lineHeight: "20px",
                }}
              >
                {isFrozen ? "Unfreeze columns" : "Freeze up to column"}
              </span>
            </button>

            <button
              className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg hover:bg-gray-50 text-left"
              onClick={() => handleAction("sort-asc")}
            >
              <ArrowUp size={20} className="text-gray-900" />
              <span
                style={{
                  color: "#202020",
                  fontSize: "14px",
                  fontFamily: "Volte",
                  fontWeight: "500",
                  lineHeight: "20px",
                }}
              >
                Sort ascending
              </span>
            </button>

            <button
              className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg hover:bg-gray-50 text-left"
              onClick={() => handleAction("sort-desc")}
            >
              <ArrowDown size={20} className="text-gray-900" />
              <span
                style={{
                  color: "#202020",
                  fontSize: "14px",
                  fontFamily: "Volte",
                  fontWeight: "500",
                  lineHeight: "20px",
                }}
              >
                Sort descending
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Normal table cell component
const TableCell = ({
  content = "Cell content",
  columnIndex = 0,
  frozenColumns = 0,
  width = "240px",
  isFirstColumn = false,
  isActionColumn = false,
  rowIndex = 0,
  onRowAction = () => {},
  isFrozenRow = false,
  isPinnedRow = false,
  isLastPinnedRow = false,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const buttonRef = useRef(null)

  // Determine if this cell is in a frozen column
  const isFrozen = columnIndex <= frozenColumns

  // Determine if this is the last frozen column
  const isLastFrozenColumn = columnIndex === frozenColumns

  // Calculate left position for frozen columns
  const calculateLeftPosition = () => {
    if (!isFrozen) return "auto"

    // Calculate the sum of widths of all previous frozen columns
    let leftPosition = 0
    for (let i = 0; i < columnIndex; i++) {
      // Use the width of the previous columns
      const prevWidth = i === 0 ? 240 : 240 // First column is 240px, others are 240px
      leftPosition += prevWidth
    }
    return `${leftPosition}px`
  }

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Handle row actions
  const handleRowAction = (action) => {
    onRowAction(rowIndex, action)
    setIsMenuOpen(false)
  }

  // For action column, render a button with three dots
  if (isActionColumn) {
    return (
      <div
        className="flex items-center justify-center p-4 bg-white relative"
        style={{
          position: isFrozen ? "sticky" : "relative",
          left: calculateLeftPosition(),
          zIndex: isFrozen ? 5 : "auto",
          borderRight: isLastFrozenColumn ? "2px solid #E6E6E6" : "none",
          minWidth: "60px",
          width: "60px",
          top: isFrozenRow ? 0 : "auto",
          backgroundColor: "white",
        }}
      >
        <button
          ref={buttonRef}
          className="p-1 rounded-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          title="More options"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <MoreHorizontal size={16} className="text-gray-600" />
        </button>

        {/* Row Action Menu - Using Portal to render outside of any container constraints */}
        {isMenuOpen && (
          <div
            ref={menuRef}
            className="fixed z-[100]"
            style={{
              boxShadow: "0px 4px 24px rgba(0, 0, 0, 0.10)",
              borderRadius: "8px",
              width: "200px",
              top: buttonRef.current?.getBoundingClientRect().bottom + window.scrollY + 4 + "px",
              left: buttonRef.current?.getBoundingClientRect().left + window.scrollX - 150 + "px", // Position left of the button to avoid edge clipping
            }}
          >
            <div className="bg-white rounded-lg p-2">
              <button
                className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg hover:bg-gray-50 text-left"
                onClick={() => handleRowAction("freeze")}
              >
                <Lock size={20} className={isFrozenRow ? "text-blue-600" : "text-gray-900"} />
                <span
                  style={{
                    color: isFrozenRow ? "#1077D6" : "#202020",
                    fontSize: "14px",
                    fontFamily: "Volte",
                    fontWeight: "500",
                    lineHeight: "20px",
                  }}
                >
                  {isFrozenRow ? "Unfreeze row" : "Freeze row"}
                </span>
              </button>
              <button
                className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg hover:bg-gray-50 text-left"
                onClick={() => handleRowAction("pin")}
              >
                {isPinnedRow ? (
                  <PinOff size={20} className="text-blue-600" />
                ) : (
                  <Pin size={20} className="text-gray-900" />
                )}
                <span
                  style={{
                    color: isPinnedRow ? "#1077D6" : "#202020",
                    fontSize: "14px",
                    fontFamily: "Volte",
                    fontWeight: "500",
                    lineHeight: "20px",
                  }}
                >
                  {isPinnedRow ? "Unpin row" : "Pin row"}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      className="flex flex-col justify-center items-start p-4 gap-2.5 self-stretch"
      style={{
        position: isFrozen ? "sticky" : "relative",
        left: calculateLeftPosition(),
        zIndex: isFrozen ? 5 : "auto",
        borderRight: isLastFrozenColumn ? "2px solid #E6E6E6" : "none",
        minWidth: isFirstColumn ? "240px" : width,
        width: isFirstColumn ? "auto" : width,
        flex: isFirstColumn ? "1 0 240px" : "0 0 auto",
        top: isFrozenRow ? 0 : "auto",
        backgroundColor: "white",
      }}
    >
      <span
        className="text-gray-800 text-sm font-medium leading-5"
        style={{ fontFamily: "var(--font-family-Volte, Volte)" }}
      >
        {content}
      </span>
    </div>
  )
}

// Pagination component
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`p-1 rounded-sm ${
          currentPage === 1 ? "text-gray-400" : "text-gray-600 hover:bg-gray-200"
        } focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
      >
        <ChevronLeft size={20} />
      </button>
      <div className="text-sm text-gray-600" style={{ fontFamily: "var(--font-family-Volte, Volte)" }}>
        Page {currentPage} of {totalPages}
      </div>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`p-1 rounded-sm ${
          currentPage === totalPages ? "text-gray-400" : "text-gray-600 hover:bg-gray-200"
        } focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
      >
        <ChevronRight size={20} />
      </button>
    </div>
  )
}

// Export Button Component with Dropdown
const ExportButton = () => {
  const [isFocused, setIsFocused] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const buttonRef = useRef(null)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleExport = (format) => {
    console.log(`Exporting as ${format}`)
    setIsMenuOpen(false)
  }

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        className="inline-flex items-center justify-center rounded-full py-1 px-4 bg-white"
        style={{
          outline: "1px solid #E6E6E6",
          outlineOffset: "-1px",
          boxShadow: isFocused ? "0px 0px 0px 4px #1077D6" : "none",
          transition: "box-shadow 0.2s ease-in-out",
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        <span
          className="text-sm font-semibold mr-1"
          style={{
            fontFamily: "var(--font-family-Volte, Volte)",
            color: "#202020",
            lineHeight: "20px",
          }}
        >
          Export
        </span>
        <ChevronDown size={16} color="#202020" />
      </button>

      {isMenuOpen && (
        <div
          ref={menuRef}
          className="absolute right-0 mt-2 z-10"
          style={{
            boxShadow: "0px 4px 24px rgba(0, 0, 0, 0.10)",
            borderRadius: "8px",
            width: "200px",
          }}
        >
          <div className="bg-white rounded-lg p-2">
            <button
              className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg hover:bg-gray-50 text-left"
              onClick={() => handleExport("XLSX")}
            >
              <span
                style={{
                  color: "#202020",
                  fontSize: "14px",
                  fontFamily: "Volte",
                  fontWeight: "500",
                  lineHeight: "20px",
                }}
              >
                Export table as XLSX
              </span>
            </button>
            <button
              className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg hover:bg-gray-50 text-left"
              onClick={() => handleExport("CSV")}
            >
              <span
                style={{
                  color: "#202020",
                  fontSize: "14px",
                  fontFamily: "Volte",
                  fontWeight: "500",
                  lineHeight: "20px",
                }}
              >
                Export table as CSV
              </span>
            </button>
            <button
              className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg hover:bg-gray-50 text-left"
              onClick={() => handleExport("SQL")}
            >
              <span
                style={{
                  color: "#202020",
                  fontSize: "14px",
                  fontFamily: "Volte",
                  fontWeight: "500",
                  lineHeight: "20px",
                }}
              >
                Export table as SQL
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Demo component to show the Table components in action
const TableDemo = () => {
  // Extended data with more rows and columns
  const allData = [
    { user: "John Doe", email: "john@example.com", role: "Admin", date: "2023-01-15", type: "Full-time" },
    { user: "Jane Smith", email: "jane@example.com", role: "Editor", date: "2023-02-20", type: "Part-time" },
    { user: "Mike Johnson", email: "mike@example.com", role: "Viewer", date: "2023-03-05", type: "Contract" },
    { user: "Sarah Williams", email: "sarah@example.com", role: "Editor", date: "2023-04-10", type: "Full-time" },
    { user: "Robert Brown", email: "robert@example.com", role: "Admin", date: "2023-05-22", type: "Full-time" },
    { user: "Emily Davis", email: "emily@example.com", role: "Viewer", date: "2023-06-14", type: "Part-time" },
    { user: "Michael Wilson", email: "michael@example.com", role: "Editor", date: "2023-07-03", type: "Contract" },
    { user: "Lisa Miller", email: "lisa@example.com", role: "Admin", date: "2023-08-18", type: "Full-time" },
    { user: "David Garcia", email: "david@example.com", role: "Viewer", date: "2023-09-05", type: "Full-time" },
    { user: "Jennifer Martinez", email: "jennifer@example.com", role: "Editor", date: "2023-10-12", type: "Part-time" },
    { user: "James Rodriguez", email: "james@example.com", role: "Admin", date: "2023-11-20", type: "Contract" },
    { user: "Patricia Lewis", email: "patricia@example.com", role: "Viewer", date: "2023-12-08", type: "Full-time" },
    { user: "Richard Lee", email: "richard@example.com", role: "Editor", date: "2024-01-15", type: "Part-time" },
    { user: "Linda Walker", email: "linda@example.com", role: "Admin", date: "2024-02-22", type: "Full-time" },
    { user: "Thomas Hall", email: "thomas@example.com", role: "Viewer", date: "2024-03-10", type: "Contract" },
    { user: "Elizabeth Young", email: "elizabeth@example.com", role: "Editor", date: "2024-04-05", type: "Full-time" },
  ]

  // State to track frozen columns
  const [frozenColumns, setFrozenColumns] = useState(-1)

  // State to track frozen and pinned rows
  const [frozenRows, setFrozenRows] = useState([])
  const [pinnedRows, setPinnedRows] = useState([])

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const rowsPerPage = 12
  const totalPages = Math.ceil(allData.length / rowsPerPage)

  // Get current page data
  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * rowsPerPage
    const endIndex = startIndex + rowsPerPage
    return allData.slice(startIndex, endIndex)
  }

  // Current page data
  const [data, setData] = useState(getCurrentPageData())

  // Update data when page changes
  useEffect(() => {
    setData(getCurrentPageData())
  }, [currentPage])

  // Handle freezing columns
  const handleFreeze = (columnIndex) => {
    setFrozenColumns(frozenColumns === columnIndex ? -1 : columnIndex)
  }

  // Handle row actions (freeze/pin)
  const handleRowAction = (rowIndex, action) => {
    const actualRowIndex = (currentPage - 1) * rowsPerPage + rowIndex

    if (action === "freeze") {
      // Check if the row is already frozen
      if (frozenRows.some(index => index === actualRowIndex)) {
        // If frozen, remove it from frozen rows
        const newFrozenRows = frozenRows.filter(index => index !== actualRowIndex)
        setFrozenRows(newFrozenRows)
      } else {
        // If not frozen, add it to frozen rows and ensure it's not pinned
        const newPinnedRows = pinnedRows.filter(index => index !== actualRowIndex)
        setPinnedRows(newPinnedRows)
        setFrozenRows([...frozenRows, actualRowIndex])
      }
    } else if (action === "pin") {
      // Check if the row is already pinned
      if (pinnedRows.some(index => index === actualRowIndex)) {
        // If pinned, remove it from pinned rows
        const newPinnedRows = pinnedRows.filter(index => index !== actualRowIndex)
        setPinnedRows(newPinnedRows)
      } else {
        // If not pinned, add it to pinned rows and ensure it's not frozen
        const newFrozenRows = frozenRows.filter(index => index !== actualRowIndex)
        setFrozenRows(newFrozenRows)
        setPinnedRows([...pinnedRows, actualRowIndex])
      }
    }
  }

  // Handle unpin action from the pin icon column
  const handleUnpin = (rowIndex) => {
    const actualRowIndex = (currentPage - 1) * rowsPerPage + rowIndex
    const newPinnedRows = pinnedRows.filter(index => index !== actualRowIndex)
    setPinnedRows(newPinnedRows)
  }

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
    }
  }

  // Get all frozen rows data - ensure we have valid indices
  const frozenRowsData = frozenRows
    .filter(index => index >= 0 && index < allData.length)
    .map(index => ({...allData[index], actualIndex: index}))

  // Get all pinned rows data - ensure we have valid indices
  const pinnedRowsData = pinnedRows
    .filter(index => index >= 0 && index < allData.length)
    .map(index => ({...allData[index], actualIndex: index}))

  // Check if a row is frozen or pinned
  const isRowFrozen = (rowIndex) => {
    const actualRowIndex = (currentPage - 1) * rowsPerPage + rowIndex
    return frozenRows.some(index => index === actualRowIndex)
  }

  const isRowPinned = (rowIndex) => {
    const actualRowIndex = (currentPage - 1) * rowsPerPage + rowIndex
    return pinnedRows.some(index => index === actualRowIndex)
  }

  // Pin column component - renders a pin icon that can be clicked to unpin a row
  const PinColumn = ({ rowIndex, isPinned = false }) => {
    return (
      <div 
        className="flex items-center justify-center p-4 bg-white relative"
        style={{
          minWidth: "40px",
          width: "40px",
          backgroundColor: "white",
          // No border-bottom here as it's applied at the row level
        }}
      >
        {isPinned && (
          <button
            className="p-1 rounded-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            title="Unpin row"
            onClick={() => handleUnpin(rowIndex)}
          >
            <Pin size={16} className="text-gray-900 fill-current" />
          </button>
        )}
      </div>
    );
  };

  // Check if we should show the pin column (if any rows are pinned)
  const showPinColumn = pinnedRows.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="bg-gray-50 rounded-lg max-w-4xl mx-auto p-6">
        {/* Container header with Export button */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-medium" style={{ fontFamily: "var(--font-family-Volte, Volte)" }}>
            Users
          </h2>
          <ExportButton />
        </div>

        {/* Table with better overflow handling to ensure dropdowns are visible */}
        <div className="w-full border border-gray-200 rounded bg-white shadow-sm">
          <div className="overflow-x-auto" style={{ position: "relative" }}>
            <div className="max-h-[400px] overflow-y-auto relative" style={{ minWidth: "min-content" }}>
              {/* Header Row */}
              <div className="flex w-full sticky top-0 z-20 min-w-max">
                {/* Pin Column Header - only visible when there are pinned rows */}
                {showPinColumn && (
                  <div
                    className="relative"
                    style={{
                      minWidth: "40px",
                      width: "40px",
                      top: 0,
                    }}
                  >
                    <div
                      className="flex py-3 px-4 items-center justify-center gap-2 w-full self-stretch border-b border-gray-200 relative"
                      style={{
                        background: "#F9F9F9",
                        height: "40px",
                      }}
                    >
                      {/* Empty header - no pin icon */}
                    </div>
                  </div>
                )}

                <TableHeaderCell
                  label="User"
                  columnIndex={0}
                  frozenColumns={frozenColumns}
                  onFreeze={handleFreeze}
                  isFirstColumn={true}
                />
                <TableHeaderCell label="Role" columnIndex={1} frozenColumns={frozenColumns} onFreeze={handleFreeze} />
                <TableHeaderCell label="Date" columnIndex={2} frozenColumns={frozenColumns} onFreeze={handleFreeze} />
                <TableHeaderCell label="Type" columnIndex={3} frozenColumns={frozenColumns} onFreeze={handleFreeze} />
                <TableHeaderCell
                  label="Actions"
                  columnIndex={4}
                  frozenColumns={frozenColumns}
                  onFreeze={handleFreeze}
                  isActionColumn={true}
                />
              </div>

              {/* Frozen Rows */}
              {frozenRowsData.map((row, rowIndex) => (
                <div 
                  key={`frozen-${row.actualIndex}`}
                  className="flex w-full sticky top-[40px] z-10 min-w-max"
                  style={{
                    borderBottom: "2px solid #E6E6E6", // Always use 2px border for frozen rows
                    backgroundColor: "white",
                    width: "100%"
                  }}
                >
                  {/* Pin Column - always displayed for alignment */}
                  {showPinColumn && <PinColumn rowIndex={row.actualIndex} isPinned={false} />}

                  <TableCell
                    content={row.user}
                    columnIndex={0}
                    frozenColumns={frozenColumns}
                    isFirstColumn={true}
                    isFrozenRow={true}
                    isPinnedRow={false}
                  />
                  <TableCell content={row.role} columnIndex={1} frozenColumns={frozenColumns} isFrozenRow={true} isPinnedRow={false} />
                  <TableCell content={row.date} columnIndex={2} frozenColumns={frozenColumns} isFrozenRow={true} isPinnedRow={false} />
                  <TableCell content={row.type} columnIndex={3} frozenColumns={frozenColumns} isFrozenRow={true} isPinnedRow={false} />
                  <TableCell
                    columnIndex={4}
                    frozenColumns={frozenColumns}
                    isActionColumn={true}
                    rowIndex={row.actualIndex}
                    onRowAction={handleRowAction}
                    isFrozenRow={true}
                    isPinnedRow={false}
                  />
                </div>
              ))}

              {/* Pinned Section Header - Only show if there are pinned rows */}
              {pinnedRows.length > 0 && (
                <div className="flex w-full bg-gray-50 py-2 px-4 items-center gap-2 min-w-max">
                  {/* Add an empty space for the pin column */}
                  {showPinColumn && <div style={{ minWidth: "40px", width: "40px" }}></div>}
                  
                  <Pin size={16} className="text-gray-600" />
                  <span 
                    className="text-gray-600 text-xs font-medium leading-4"
                    style={{ fontFamily: "var(--font-family-Volte, Volte)" }}
                  >
                    Pinned
                  </span>
                </div>
              )}

              {/* Pinned Rows */}
              {data.map((row, rowIndex) => {
                // Only render pinned rows in this section
                if (!isRowPinned(rowIndex)) return null;
                
                // Find if this is the last pinned row by checking if any subsequent rows are pinned
                let isLastPinnedRow = true;
                for (let i = rowIndex + 1; i < data.length; i++) {
                  if (isRowPinned(i)) {
                    isLastPinnedRow = false;
                    break;
                  }
                }
                
                return (
                  <div 
                    key={`pinned-${rowIndex}`}
                    className="flex w-full min-w-max"
                    style={{
                      backgroundColor: "white",
                      borderBottom: isLastPinnedRow 
                        ? "2px solid #E6E6E6" // Grey divider under the last pinned row
                        : "1px solid #E6E6E6" // Normal divider for other pinned rows
                    }}
                  >
                    {/* Pin Column - visible and active for pinned rows */}
                    {showPinColumn && <PinColumn rowIndex={rowIndex} isPinned={true} />}

                    <TableCell
                      content={row.user}
                      columnIndex={0}
                      frozenColumns={frozenColumns}
                      isFirstColumn={true}
                      isFrozenRow={false}
                      isPinnedRow={true}
                      isLastPinnedRow={isLastPinnedRow}
                    />
                    <TableCell
                      content={row.role}
                      columnIndex={1}
                      frozenColumns={frozenColumns}
                      isFrozenRow={false}
                      isPinnedRow={true}
                      isLastPinnedRow={isLastPinnedRow}
                    />
                    <TableCell
                      content={row.date}
                      columnIndex={2}
                      frozenColumns={frozenColumns}
                      isFrozenRow={false}
                      isPinnedRow={true}
                      isLastPinnedRow={isLastPinnedRow}
                    />
                    <TableCell
                      content={row.type}
                      columnIndex={3}
                      frozenColumns={frozenColumns}
                      isFrozenRow={false}
                      isPinnedRow={true}
                      isLastPinnedRow={isLastPinnedRow}
                    />
                    <TableCell
                      columnIndex={4}
                      frozenColumns={frozenColumns}
                      isActionColumn={true}
                      rowIndex={rowIndex}
                      onRowAction={handleRowAction}
                      isFrozenRow={false}
                      isPinnedRow={true}
                      isLastPinnedRow={isLastPinnedRow}
                    />
                  </div>
                );
              })}

              {/* Regular Data Rows */}
              {data.map((row, rowIndex) => {
                // Skip rows that are frozen or pinned, as they are rendered elsewhere
                if (isRowFrozen(rowIndex) || isRowPinned(rowIndex)) return null;
                
                return (
                  <div 
                    key={`regular-${rowIndex}`} 
                    className="flex w-full min-w-max"
                    style={{
                      borderBottom: "1px solid #E6E6E6", // Always apply 1px border for regular rows
                      backgroundColor: "white"
                    }}
                  >
                    {/* Pin Column - always displayed for alignment */}
                    {showPinColumn && <PinColumn rowIndex={rowIndex} isPinned={false} />}

                    <TableCell
                      content={row.user}
                      columnIndex={0}
                      frozenColumns={frozenColumns}
                      isFirstColumn={true}
                      isFrozenRow={false}
                      isPinnedRow={false}
                    />
                    <TableCell
                      content={row.role}
                      columnIndex={1}
                      frozenColumns={frozenColumns}
                      isFrozenRow={false}
                      isPinnedRow={false}
                    />
                    <TableCell
                      content={row.date}
                      columnIndex={2}
                      frozenColumns={frozenColumns}
                      isFrozenRow={false}
                      isPinnedRow={false}
                    />
                    <TableCell
                      content={row.type}
                      columnIndex={3}
                      frozenColumns={frozenColumns}
                      isFrozenRow={false}
                      isPinnedRow={false}
                    />
                    <TableCell
                      columnIndex={4}
                      frozenColumns={frozenColumns}
                      isActionColumn={true}
                      rowIndex={rowIndex}
                      onRowAction={handleRowAction}
                      isFrozenRow={false}
                      isPinnedRow={false}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Pagination */}
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
      </div>
    </div>
  )
}

export default TableDemo
