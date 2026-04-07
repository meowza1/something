-- Container Component for Linoria UI
-- Inherits from BaseComponent
-- Provides styled container with padding and background

local BaseComponent = require(script.Parent.BaseComponent)
local Utility = require(script.Parent.Parent.utils.Utility)

local Container = {}
Container.__index = Container
setmetatable(Container, BaseComponent)

function Container.new(options)
    local self = BaseComponent.new(options)
    setmetatable(self, Container)
    
    -- Container specific properties
    self.BackgroundTransparency = options.BackgroundTransparency or 0.8
    self.BackgroundColor = options.BackgroundColor or Utility.Colors.ContainerBackground
    self.BorderColor = options.BorderColor or Utility.Colors.ContainerBorder
    self.BorderSize = options.BorderSize or 1
    self.Padding = options.Padding or 8
    self.CornerRadius = options.CornerRadius or UDim.new(0, 4)
    
    -- Create container UI
    self:CreateUI()
    
    return self
end

function Container:CreateUI()
    -- Main frame with styling
    self.Frame.BackgroundColor3 = self.BackgroundColor
    self.Frame.BackgroundTransparency = self.BackgroundTransparency
    self.Frame.BorderColor3 = self.BorderColor
    self.Frame.BorderSizePixel = self.BorderSize
    
    -- Corner radius
    self.Corner = Instance.new("UICorner")
    self.Corner.CornerRadius = self.CornerRadius
    self.Corner.Parent = self.Frame
    
    -- Padding
    self.PaddingInstance = Instance.new("UIPadding")
    self.PaddingInstance.PaddingTop = UDim.new(0, self.Padding)
    self.PaddingInstance.PaddingBottom = UDim.new(0, self.Padding)
    self.PaddingInstance.PaddingLeft = UDim.new(0, self.Padding)
    self.PaddingInstance.PaddingRight = UDim.new(0, self.Padding)
    self.PaddingInstance.Parent = self.Frame
end

function Container:SetBackgroundColor(color)
    self.BackgroundColor = color
    self.Frame.BackgroundColor3 = color
end

function Container:SetBackgroundTransparency(transparency)
    self.BackgroundTransparency = transparency
    self.Frame.BackgroundTransparency = transparency
end

function Container:SetBorderColor(color)
    self.BorderColor = color
    self.Frame.BorderColor3 = color
end

function Container:SetBorderSize(size)
    self.BorderSize = size
    self.Frame.BorderSizePixel = size
end

function Container:SetPadding(padding)
    self.Padding = padding
    self.PaddingInstance.PaddingTop = UDim.new(0, padding)
    self.PaddingInstance.PaddingBottom = UDim.new(0, padding)
    self.PaddingInstance.PaddingLeft = UDim.new(0, padding)
    self.PaddingInstance.PaddingRight = UDim.new(0, padding)
end

function Container:SetCornerRadius(radius)
    self.CornerRadius = radius
    self.Corner.CornerRadius = radius
end

return Container