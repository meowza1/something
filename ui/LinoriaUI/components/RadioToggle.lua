-- RadioToggle Component for Linoria UI
-- Inherits from BaseComponent

local BaseComponent = require(script.Parent.BaseComponent)
local Utility = require(script.Parent.Parent.utils.Utility)

local RadioToggle = {}
RadioToggle.__index = RadioToggle
setmetatable(RadioToggle, BaseComponent)

function RadioToggle.new(options)
    local self = BaseComponent.new(options)
    setmetatable(self, RadioToggle)
    
    -- RadioToggle specific properties
    self.Text = options.Text or "Radio"
    self.Value = options.Value ~= nil and options.Value or false
    self.Group = options.Group or "default"
    self.Callback = options.Callback or function() end
    self.Width = options.Width or 200
    self.Height = options.Height or 30
    
    -- Update size
    self.Frame.Size = UDim2.new(0, self.Width, 0, self.Height)
    
    -- Create radio toggle UI
    self:CreateUI()
    
    return self
end

function RadioToggle:CreateUI()
    -- Main frame (background)
    self.Background = Instance.new("Frame")
    self.Background.Name = "RadioBackground"
    self.Background.Parent = self.Frame
    self.Background.BackgroundTransparency = 1
    self.Background.Size = UDim2.new(1, 0, 1, 0)
    
    -- Radio button (circle)
    self.Button = Instance.new("Frame")
    self.Button.Name = "RadioButton"
    self.Button.Parent = self.Background
    self.Button.BackgroundColor3 = self.Value and Utility.Colors.Accent or Utility.Colors.Background
    self.Button.BorderColor3 = Utility.Colors.Border
    self.Button.BorderSizePixel = 1
    self.Button.Position = UDim2.new(0, 4, 0.5, -6)
    self.Button.Size = UDim2.new(0, 12, 0, 12)
    self.Button.BorderRadius = UDim.new(0, 6) -- Circular
    
    -- Inner circle (for checked state)
    self.Inner = Instance.new("Frame")
    self.Inner.Name = "RadioInner"
    self.Inner.Parent = self.Button
    self.Inner.BackgroundColor3 = self.Value and Utility.Colors.Accent or Utility.Colors.Background
    self.Inner.BorderSizePixel = 0
    self.Inner.Position = UDim2.new(0.5, -3, 0.5, -3)
    self.Inner.Size = UDim2.new(0, 6, 0, 6)
    self.Inner.BorderRadius = UDim.new(0, 3)
    self.Inner.Visible = self.Value
    
    -- Text label
    self.Label = Instance.new("TextLabel")
    self.Label.Name = "RadioLabel"
    self.Label.Parent = self.Background
    self.Label.BackgroundTransparency = 1
    self.Label.Position = UDim2.new(0, self.Button.AbsoluteSize.X + 12, 0, 0)
    self.Label.Size = UDim2.new(1, -(self.Button.AbsoluteSize.X + 16), 1, 0)
    self.Label.Text = self.Text
    self.Label.TextColor3 = Utility.Colors.Text
    self.Label.Font = Enum.Font.SourceSans
    self.Label.TextSize = 14
    self.Label.TextXAlignment = Enum.TextXAlignment.Left
    
    -- Click to toggle
    self.Background.InputBegan:Connect(function(input)
        if input.UserInputType == Enum.UserInputType.MouseButton1 or
           input.UserInputType == Enum.UserInputType.Touch then
            self:SetValue(true) -- This will notify the group
        end
    end)
    
    -- Initial visual state
    self:UpdateVisual()
end

function RadioToggle:UpdateVisual()
    self.Button.BackgroundColor3 = self.Value and Utility.Colors.Accent or Utility.Colors.Background
    self.Button.BorderColor3 = Utility.Colors.Border
    self.Inner.BackgroundColor3 = self.Value and Utility.Colors.Accent or Utility.Colors.Background
    self.Inner.Visible = self.Value
end

function RadioToggle:SetValue(value)
    if value == self.Value then return end
    
    self.Value = value ~= nil and value or false
    self:UpdateVisual()
    self.Callback(self.Value)
    
    -- Notify radio group manager
    local RadioManager = require(script.Parent.Parent.utils.RadioManager)
    RadioManager:NotifyGroupChange(self.Group, self)
end

function RadioToggle:GetValue()
    return self.Value
end

function RadioToggle:SetText(text)
    self.Text = text
    self.Label.Text = text
end

function RadioToggle:SetGroup(group)
    self.Group = group
end

return RadioToggle