-- Toggle Component for Linoria UI
-- Inherits from BaseComponent

local BaseComponent = require(script.Parent.BaseComponent)
local Utility = require(script.Parent.Parent.utils.Utility)

local Toggle = {}
Toggle.__index = Toggle
setmetatable(Toggle, BaseComponent)

function Toggle.new(options)
    local self = BaseComponent.new(options)
    setmetatable(self, Toggle)
    
    -- Toggle specific properties
    self.Text = options.Text or "Toggle"
    self.Value = options.Value ~= nil and options.Value or false
    self.Callback = options.Callback or function() end
    self.Width = options.Width or 200
    self.Height = options.Height or 30
    
    -- Update size
    self.Frame.Size = UDim2.new(0, self.Width, 0, self.Height)
    
    -- Create toggle UI
    self:CreateUI()
    
    return self
end

function Toggle:CreateUI()
    -- Main frame (background)
    self.Background = Instance.new("Frame")
    self.Background.Name = "ToggleBackground"
    self.Background.Parent = self.Frame
    self.Background.BackgroundColor3 = Utility.Colors.Background
    self.Background.BorderColor3 = Utility.Colors.Border
    self.Background.Size = UDim2.new(1, 0, 1, 0)
    
    -- Toggle button (circle)
    self.Button = Instance.new("Frame")
    self.Button.Name = "ToggleButton"
    self.Button.Parent = self.Background
    self.Button.BackgroundColor3 = self.Value and Utility.Colors.Accent or Utility.Colors.Border
    self.Button.BorderSizePixel = 0
    self.Button.Position = UDim2.new(0, self.Value and (self.Height - 6) or 2, 0.5, -6)
    self.Button.Size = UDim2.new(0, 12, 0, 12)
    self.Button.BorderRadius = UDim.new(0, 6) -- Circular
    
    -- Text label
    self.Label = Instance.new("TextLabel")
    self.Label.Name = "ToggleLabel"
    self.Label.Parent = self.Background
    self.Label.BackgroundTransparency = 1
    self.Label.Position = UDim2.new(0, self.Height + 8, 0, 0)
    self.Label.Size = UDim2.new(1, -(self.Height + 16), 1, 0)
    self.Label.Text = self.Text
    self.Label.TextColor3 = Utility.Colors.Text
    self.Label.Font = Enum.Font.SourceSans
    self.Label.TextSize = 14
    self.Label.TextXAlignment = Enum.TextXAlignment.Left
    
    -- Click to toggle
    self.Background.InputBegan:Connect(function(input)
        if input.UserInputType == Enum.UserInputType.MouseButton1 or
           input.UserInputType == Enum.UserInputType.Touch then
            self.Value = not self.Value
            self:UpdateVisual()
            self.Callback(self.Value)
        end
    end)
    
    -- Initial visual state
    self:UpdateVisual()
end

function Toggle:UpdateVisual()
    -- Animate toggle button position
    local targetX = self.Value and (self.Background.AbsoluteSize.X - self.Button.AbsoluteSize.X - 4) or 4
    self.Button:TweenPosition(
        UDim2.new(0, targetX, 0.5, -self.Button.AbsoluteSize.Y/2),
        Enum.EasingDirection.InOut,
        Enum.EasingStyle.Quad,
        0.2,
        true
    )
    
    -- Change button color
    self.Button:TweenBackgroundColor3(
        self.Value and Utility.Colors.Accent or Utility.Colors.Border,
        Enum.EasingDirection.InOut,
        Enum.EasingStyle.Quad,
        0.2,
        true
    )
end

function Toggle:GetValue()
    return self.Value
end

function Toggle:SetValue(value)
    self.Value = value ~= nil and value or false
    self:UpdateVisual()
    self.Callback(self.Value)
end

function Toggle:SetText(text)
    self.Text = text
    self.Label.Text = text
end

return Toggle