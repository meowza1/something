-- Tab Component for Linoria UI
-- Inherits from BaseComponent
-- Supports up to 4 columns with auto-scaling

local BaseComponent = require(script.Parent.BaseComponent)
local Column = require(script.Parent.Column)
local Utility = require(script.Parent.Parent.utils.Utility)

local Tab = {}
Tab.__index = Tab
setmetatable(Tab, BaseComponent)

function Tab.new(options)
    local self = BaseComponent.new(options)
    setmetatable(self, Tab)
    
    -- Tab specific properties
    self.Title = options.Title or "Tab"
    self.Columns = options.Columns or 1 -- 1-4 columns
    self.ColumnSpacing = options.ColumnSpacing or 10
    self.Visible = options.Visible ~= nil and options.Visible or true
    self.Parent = options.Parent or nil
    
    -- Validate columns (1-4)
    self.Columns = math.clamp(self.Columns, 1, 4)
    
    -- Update size (will be set by parent)
    self.Frame.Size = UDim2.new(1, 0, 1, 0)
    
    -- Create tab UI
    self:CreateUI()
    
    return self
end

function Tab:CreateUI()
    -- Main container
    self.Container = Instance.new("Frame")
    self.Container.Name = "TabContainer"
    self.Container.Parent = self.Frame
    self.Container.BackgroundTransparency = 1
    self.Container.Size = UDim2.new(1, 0, 1, 0)
    self.Container.ClipsDescendants = true
    
    -- Create column frames based on column count
    self.ColumnFrames = {}
    self.ColumnObjects = {}
    
    local columnWidth = (1 - ((self.Columns - 1) * self.ColumnSpacing / self.Frame.AbsoluteSize.X)) / self.Columns
    
    for i = 1, self.Columns do
        local columnFrame = Instance.new("Frame")
        columnFrame.Name = "ColumnFrame_"..i
        columnFrame.Parent = self.Container
        columnFrame.BackgroundTransparency = 1
        columnFrame.Position = UDim2.new(
            (i-1) * (columnWidth + self.ColumnSpacing / self.Frame.AbsoluteSize.X),
            0,
            0,
            0
        )
        columnFrame.Size = UDim2.new(columnWidth, 0, 1, 0)
        columnFrame.ClipsDescendants = true
        
        -- UI List Layout for automatic vertical stacking
        local listLayout = Instance.new("UIListLayout")
        listLayout.Parent = columnFrame
        listLayout.SortOrder = Enum.SortOrder.LayoutOrder
        listLayout.Padding = UDim.new(0, 8) -- Padding between elements
        
        table.insert(self.ColumnFrames, columnFrame)
        
        -- Create column object
        local columnObj = Column.new({
            Parent = columnFrame,
            Name = "Column_"..i
        })
        table.insert(self.ColumnObjects, columnObj)
    end
    
    -- Tab button (for tab header)
    self.Button = Instance.new("TextButton")
    self.Button.Name = "TabButton"
    self.Button.Parent = nil -- Will be set by tab container
    self.Button.BackgroundTransparency = 1
    self.Button.Size = UDim2.new(0, 100, 0, 30)
    self.Button.Text = self.Title
    self.Button.TextColor3 = Utility.Colors.Text
    self.Button.Font = Enum.Font.SourceSans
    self.Button.TextSize = 14
    self.Button.AutoButtonColor = false
    
    -- Set initial visibility
    self:SetVisible(self.Visible)
end

function Tab:AddToColumn(columnIndex, element)
    if columnIndex < 1 or columnIndex > self.Columns then
        warn("Column index out of range. Must be between 1 and "..self.Columns)
        return nil
    end
    
    local columnObj = self.ColumnObjects[columnIndex]
    if columnObj then
        return columnObj:AddElement(element)
    end
    return nil
end

function Tab:GetColumn(columnIndex)
    if columnIndex < 1 or columnIndex > self.Columns then
        warn("Column index out of range. Must be between 1 and "..self.Columns)
        return nil
    end
    return self.ColumnObjects[columnIndex]
end

function Tab:SetTitle(title)
    self.Title = title
    if self.Button then
        self.Button.Text = title
    end
end

function Tab:SetVisible(visible)
    self.Visible = visible
    if self.Frame then
        self.Frame.Visible = visible
    end
end

function Tab:IsVisible()
    return self.Visible
end

return Tab