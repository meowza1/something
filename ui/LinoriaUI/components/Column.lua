-- Column Component for Linoria UI
-- Inherits from BaseComponent
-- Handles automatic layout of UI elements

local BaseComponent = require(script.Parent.BaseComponent)
local Utility = require(script.Parent.Parent.utils.Utility)

local Column = {}
Column.__index = Column
setmetatable(Column, BaseComponent)

function Column.new(options)
    local self = BaseComponent.new(options)
    setmetatable(self, Column)
    
    -- Column specific properties
    self.Padding = options.Padding or 4
    self.ElementSpacing = options.ElementSpacing or 8
    
    -- Update size (will be set by parent)
    self.Frame.Size = UDim2.new(1, 0, 1, 0)
    
    -- Create column UI
    self:CreateUI()
    
    return self
end

function Column:CreateUI()
    -- UI List Layout for automatic vertical stacking
    self.ListLayout = Instance.new("UIListLayout")
    self.ListLayout.Parent = self.Frame
    self.ListLayout.SortOrder = Enum.SortOrder.LayoutOrder
    self.ListLayout.Padding = UDim.new(0, self.ElementSpacing)
    
    -- Padding
    self.PaddingInstance = Instance.new("UIPadding")
    self.PaddingInstance.Parent = self.Frame
    self.PaddingInstance.PaddingTop = UDim.new(0, self.Padding)
    self.PaddingInstance.PaddingBottom = UDim.new(0, self.Padding)
    self.PaddingInstance.PaddingLeft = UDim.new(0, self.Padding)
    self.PaddingInstance.PaddingRight = UDim.new(0, self.Padding)
end

function Column:AddElement(element)
    -- Check if element has a Frame property (BaseComponent)
    local elementFrame = element.Frame or element
    
    -- Set parent to column frame
    elementFrame.Parent = self.Frame
    
    -- Return the element for chaining
    return element
end

function Column:Clear()
    -- Destroy all children except UIListLayout and UIPadding
    for _, child in ipairs(self.Frame:GetChildren()) do
        if not (child:IsA("UIListLayout") or child:IsA("UIPadding")) then
            child:Destroy()
        end
    end
end

function Column:GetElements()
    local elements = {}
    for _, child in ipairs(self.Frame:GetChildren()) do
        if not (child:IsA("UIListLayout") or child:IsA("UIPadding")) then
            table.insert(elements, child)
        end
    end
    return elements
end

return Column