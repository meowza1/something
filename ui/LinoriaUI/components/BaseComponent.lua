-- Base Component for Linoria UI
-- Handles common functionality like draggability, visibility, etc.

local BaseComponent = {}
BaseComponent.__index = BaseComponent

function BaseComponent.new(options)
    local self = setmetatable({}, BaseComponent)
    
    -- Basic properties
    self.Name = options.Name or "Component"
    self.Parent = options.Parent or nil
    self.Visible = options.Visible ~= nil and options.Visible or true
    self.Position = options.Position or UDim2.new(0, 0, 0, 0)
    self.Size = options.Size or UDim2.new(0, 100, 0, 30)
    
    -- Dragging properties
    self.Draggable = options.Draggable ~= nil and options.Draggable or false
    self.DragStart = nil
    self.StartPos = nil
    
    -- Create the main frame
    self.Frame = Instance.new("Frame")
    self.Frame.Name = self.Name
    self.Frame.Parent = self.Parent
    self.Frame.BackgroundTransparency = 1
    self.Frame.Position = self.Position
    self.Frame.Size = self.Size
    self.Frame.Visible = self.Visible
    self.Frame.ClipsDescendants = true
    
    -- Setup dragging if enabled
    if self.Draggable then
        self:EnableDrag()
    end
    
    return self
end

function BaseComponent:EnableDrag()
    local function updateInput(input)
        local delta = input.Position - self.DragStart
        self.Frame.Position = UDim2.new(
            self.StartPos.X.Scale,
            self.StartPos.X.Offset + delta.X,
            self.StartPos.Y.Scale,
            self.StartPos.Y.Offset + delta.Y
        )
    end
    
    local function beginDrag(input)
        if input.UserInputType == Enum.UserInputType.MouseButton1 or 
           input.UserInputType == Enum.UserInputType.Touch then
            self.DragStart = input.Position
            self.StartPos = self.Frame.Position
            
            input.Changed:Connect(function()
                if input.UserInputState == Enum.UserInputState.End then
                    self.DragStart = nil
                end
            end)
        end
    end
    
    self.Frame.InputBegan:Connect(beginDrag)
    self.Frame.InputChanged:Connect(function(input)
        if input.UserInputType == Enum.UserInputType.MouseMovement or 
           input.UserInputType == Enum.UserInputType.Touch then
            updateInput(input)
        end
    end)
end

function BaseComponent:SetVisible(visible)
    self.Visible = visible
    if self.Frame then
        self.Frame.Visible = visible
    end
end

function BaseComponent:IsVisible()
    return self.Visible
end

function BaseComponent:Destroy()
    if self.Frame then
        self.Frame:Destroy()
    end
end

return BaseComponent