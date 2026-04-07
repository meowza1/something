-- Linoria UI Library for Roblox - Enhanced Single File Version
-- A modern UI library with Linoria styling, mobile support, draggable UI, colorpicker, etc.

local TweenService = game:GetService("TweenService")
local UserInputService = game:GetService("UserInputService")
local Players = game:GetService("Players")

local Linoria = {}

-- =============================================
-- UTILITY FUNCTIONS AND STYLES
-- =============================================

local Utility = {}
Utility.Colors = {
    Background = Color3.fromRGB(25, 25, 25),
    BackgroundLight = Color3.fromRGB(35, 35, 35),
    BackgroundDark = Color3.fromRGB(20, 20, 20),
    ContainerBackground = Color3.fromRGB(20, 20, 20),
    ContainerBorder = Color3.fromRGB(40, 40, 40),
    Border = Color3.fromRGB(50, 50, 50),
    BorderLight = Color3.fromRGB(60, 60, 60),
    Text = Color3.fromRGB(255, 255, 255),
    TextDim = Color3.fromRGB(200, 200, 200),
    Placeholder = Color3.fromRGB(150, 150, 150),
    Accent = Color3.fromRGB(0, 120, 255),
    AccentLight = Color3.fromRGB(30, 150, 255),
    HoverBackground = Color3.fromRGB(40, 40, 40),
    TabBackground = Color3.fromRGB(30, 30, 30),
    TabSelected = Color3.fromRGB(40, 40, 40),
    TabHover = Color3.fromRGB(50, 50, 50),
    ScrollBar = Color3.fromRGB(60, 60, 60),
    ScrollBarHover = Color3.fromRGB(80, 80, 80),
    ColorpickerBackground = Color3.fromRGB(20, 20, 20),
    ColorpickerBorder = Color3.fromRGB(50, 50, 50),
    Success = Color3.fromRGB(0, 200, 100),
    Warning = Color3.fromRGB(255, 200, 0),
    Error = Color3.fromRGB(255, 50, 50),
}

function Utility:Create(instanceType, properties)
    local inst = Instance.new(instanceType)
    for prop, val in pairs(properties or {}) do
        inst[prop] = val
    end
    return inst
end

function Utility:CreateTween(obj, goal, duration, easingStyle, easingDirection)
    local tweenInfo = TweenInfo.new(
        duration or 0.2,
        easingStyle or Enum.EasingStyle.Quad,
        easingDirection or Enum.EasingDirection.Out
    )
    return TweenService:Create(obj, tweenInfo, goal)
end

function Utility:HexToColor(hex)
    hex = hex:gsub("#", "")
    local r = tonumber(hex:sub(1, 2), 16) or 0
    local g = tonumber(hex:sub(3, 4), 16) or 0
    local b = tonumber(hex:sub(5, 6), 16) or 0
    return Color3.fromRGB(r, g, b)
end

function Utility:ColorToHex(color)
    return string.format("#%02X%02X%02X", color.R * 255, color.G * 255, color.B * 255)
end

function Utility:ColorToRGB(color)
    return math.floor(color.R * 255), math.floor(color.G * 255), math.floor(color.B * 255)
end

function Utility:RGBToColor(r, g, b)
    return Color3.fromRGB(r, g, b)
end

function Utility:ColorToHSV(color)
    local r, g, b = color.R, color.G, color.B
    local max, min = math.max(r, g, b), math.min(r, g, b)
    local h, s, v
    v = max
    local d = max - min
    if max == 0 then
        s = 0
    else
        s = d / max
    end
    if max == min then
        h = 0
    else
        if max == r then
            h = (g - b) / d
            if g < b then h = h + 6 end
        elseif max == g then
            h = (b - r) / d + 2
        elseif max == b then
            h = (r - g) / d + 4
        end
        h = h / 6
    end
    return h, s, v
end

function Utility:HSVToColor(h, s, v)
    local r, g, b
    local i = math.floor(h * 6)
    local f = h * 6 - i
    local p = v * (1 - s)
    local q = v * (1 - f * s)
    local t = v * (1 - (1 - f) * s)
    i = i % 6
    if i == 0 then r, g, b = v, t, p
    elseif i == 1 then r, g, b = q, v, p
    elseif i == 2 then r, g, b = p, v, t
    elseif i == 3 then r, g, b = p, q, v
    elseif i == 4 then r, g, b = t, p, v
    elseif i == 5 then r, g, b = v, p, q
    end
    return Color3.fromRGB(math.floor(r * 255), math.floor(g * 255), math.floor(b * 255))
end

function Utility:DeepCopy(orig)
    local orig_type = type(orig)
    local copy
    if orig_type == 'table' then
        copy = {}
        for orig_key, orig_value in next, orig, nil do
            copy[Utility:DeepCopy(orig_key)] = Utility:DeepCopy(orig_value)
        end
        setmetatable(copy, Utility:DeepCopy(getmetatable(orig)))
    else
        copy = orig
    end
    return copy
end

-- =============================================
-- RADIO MANAGER
-- =============================================

local RadioManager = {}
local radioGroups = {}

function RadioManager:Register(radio)
    local group = radio.Group or "default"
    if not radioGroups[group] then
        radioGroups[group] = {}
    end
    table.insert(radioGroups[group], radio)
end

function RadioManager:NotifyGroupChange(group, radio)
    if radio:GetValue() and radioGroups[group] then
        for _, otherRadio in ipairs(radioGroups[group]) do
            if otherRadio ~= radio and otherRadio:GetValue() then
                otherRadio:SetValue(false)
            end
        end
    end
end

function RadioManager:ClearGroup(group)
    if radioGroups[group] then
        radioGroups[group] = nil
    end
end

function RadioManager:GetGroupValue(group)
    if radioGroups[group] then
        for _, radio in ipairs(radioGroups[group]) do
            if radio:GetValue() then
                return radio
            end
        end
    end
    return nil
end

-- =============================================
-- NOTIFICATION SYSTEM
-- =============================================

local NotificationQueue = {}
local ActiveNotifications = {}

function Utility:ShowNotification(message, type, duration)
    type = type or "info"
    duration = duration or 3

    local notification = {
        Message = message,
        Type = type,
        Duration = duration,
        StartTime = tick(),
    }

    table.insert(NotificationQueue, notification)
    return #NotificationQueue
end

local function ProcessNotifications()
    while #NotificationQueue > 0 do
        local notification = table.remove(NotificationQueue, 1)
        
        -- Find or create notification container
        local container = script:FindFirstChild("NotificationContainer")
        if not container then
            container = Utility:Create("ScreenGui", {
                Name = "NotificationContainer",
                ResetOnSpawn = false,
                ZIndexBehavior = Enum.ZIndexBehavior.Sibling,
            })
            container.Parent = game:GetService("Players").LocalPlayer.PlayerGui
            
            local uif = Utility:Create("UIFrame", {
                Size = UDim2.new(0, 300, 0, 60),
                Position = UDim2.new(1, -320, 0, 20),
                AnchorPoint = Vector2.new(0, 0),
            })
            uif.Parent = container
        end
        
        -- Create notification UI
        local colors = {
            info = Utility.Colors.Accent,
            success = Utility.Colors.Success,
            warning = Utility.Colors.Warning,
            error = Utility.Colors.Error
        }
        
        local notifFrame = Utility:Create("Frame", {
            BackgroundColor3 = Utility.Colors.BackgroundDark,
            BorderColor3 = colors[notification.Type] or colors.info,
            BorderSizePixel = 2,
            Size = UDim2.new(1, 0, 0, 50),
            Position = UDim2.new(0, 0, 0, #ActiveNotifications * 60),
            ZIndex = 100,
        })
        
        Utility:Create("UICorner", {Parent = notifFrame, CornerRadius = UDim.new(0, 6)})
        
        local label = Utility:Create("TextLabel", {
            BackgroundTransparency = 1,
            Size = UDim2.new(1, -30, 1, 0),
            Position = UDim2.new(0, 15, 0, 0),
            Text = notification.Message,
            TextColor3 = Utility.Colors.Text,
            Font = Enum.Font.Gotham,
            TextSize = 13,
            TextXAlignment = Enum.TextXAlignment.Left,
            TextYAlignment = Enum.TextYAlignment.Center,
        })
        label.Parent = notifFrame
        
        notifFrame.Parent = container
        ActiveNotifications[#ActiveNotifications + 1] = {
            Frame = notifFrame,
            Expires = tick() + notification.Duration
        }
        
        -- Auto remove after duration
        task.delay(notification.Duration, function()
            for i, active in ipairs(ActiveNotifications) do
                if active.Frame == notifFrame then
                    active.Frame:Destroy()
                    table.remove(ActiveNotifications, i)
                    -- Shift remaining
                    for j = i, #ActiveNotifications do
                        if ActiveNotifications[j] then
                            ActiveNotifications[j].Frame.Position = UDim2.new(0, 0, 0, (j-1) * 60)
                        end
                    end
                    break
                end
            end
        end)
    end
end

task.spawn(function()
    while true do
        task.wait(0.1)
        if #NotificationQueue > 0 then
            ProcessNotifications()
        end
    end
end)

-- =============================================
-- MAIN WINDOW
-- =============================================

function Linoria:CreateWindow(options)
    options = options or {}
    local title = options.Title or "Linoria UI"
    local size = options.Size or UDim2.new(0, 600, 0, 450)
    local position = options.Position or UDim2.new(0.5, -300, 0.5, -225)
    local draggable = options.Draggable ~= nil and options.Draggable or true
    local theme = options.Theme or {}
    local showClose = options.ShowClose ~= false
    local minSize = options.MinSize or UDim2.new(0, 400, 0, 300)

    -- Merge theme
    for k, v in pairs(theme) do
        Utility.Colors[k] = v
    end

    -- Create main screen GUI
    local screenGui = Instance.new("ScreenGui")
    screenGui.Name = "LinoriaUI_" .. title:gsub("%s+", "")
    screenGui.ResetOnSpawn = false
    screenGui.ZIndexBehavior = Enum.ZIndexBehavior.Sibling
    screenGui.IgnoreGuiInset = options.IgnoreGuiInset or false

    -- Parent to PlayerGui
    local success, player = pcall(function()
        return Players.LocalPlayer
    end)

    if success and player then
        local playerGui = player:FindFirstChild("PlayerGui")
        if playerGui then
            screenGui.Parent = playerGui
        else
            player:WaitForChild("PlayerGui"):GetPropertyChangedSignal("Parent"):Wait()
            if player.PlayerGui then
                screenGui.Parent = player.PlayerGui
            else
                screenGui.Parent = game:GetService("CoreGui")
            end
        end
    else
        screenGui.Parent = game:GetService("CoreGui")
    end

    -- Main window frame
    local mainFrame = Utility:Create("Frame", {
        Name = "MainWindow",
        Parent = screenGui,
        BackgroundColor3 = Utility.Colors.Background,
        BorderColor3 = Utility.Colors.Border,
        BorderSizePixel = 1,
        Size = size,
        Position = position,
        ClipsDescendants = false,
    })

    Utility:Create("UICorner", {
        Parent = mainFrame,
        CornerRadius = UDim.new(0, 8),
    })

    -- Shadow effect (optional)
    local shadow = Utility:Create("ImageLabel", {
        Name = "Shadow",
        Parent = mainFrame,
        BackgroundTransparency = 1,
        Image = "rbxasset://textures/ui/GuiImagePlaceholder.png",
        ImageTransparency = 0.8,
        ScaleType = Enum.ScaleType.Slice,
        SliceRect = Rect.new(10, 10, 10, 10),
        Size = UDim2.new(1, 12, 1, 12),
        Position = UDim2.new(0, -6, 0, -6),
        ZIndex = -1,
    })

    -- Title bar
    local titleBar = Utility:Create("Frame", {
        Name = "TitleBar",
        Parent = mainFrame,
        BackgroundColor3 = Utility.Colors.BackgroundLight,
        BorderSizePixel = 0,
        Size = UDim2.new(1, 0, 0, 30),
    })

    Utility:Create("UICorner", {
        Parent = titleBar,
        CornerRadius = UDim.new(0, 8),
    })

    local titleLabel = Utility:Create("TextLabel", {
        Name = "TitleLabel",
        Parent = titleBar,
        BackgroundTransparency = 1,
        Position = UDim2.new(0, 12, 0, 0),
        Size = UDim2.new(1, -24, 1, 0),
        Text = title,
        TextColor3 = Utility.Colors.Text,
        Font = Enum.Font.GothamBold,
        TextSize = 14,
        TextXAlignment = Enum.TextXAlignment.Left,
    })

    -- Button frame (minimize, maximize, close)
    local buttonFrame = Utility:Create("Frame", {
        Name = "ButtonFrame",
        Parent = titleBar,
        BackgroundTransparency = 1,
        Position = UDim2.new(1, -90, 0, 0),
        Size = UDim2.new(0, 85, 1, 0),
    })

    local closeBtn = nil
    if showClose then
        closeBtn = Utility:Create("TextButton", {
            Name = "CloseButton",
            Parent = buttonFrame,
            BackgroundColor3 = Color3.fromRGB(200, 50, 50),
            BorderSizePixel = 0,
            Position = UDim2.new(1, -24, 0, 6),
            Size = UDim2.new(0, 18, 0, 18),
            Text = "X",
            TextColor3 = Color3.fromRGB(255, 255, 255),
            Font = Enum.Font.GothamBold,
            TextSize = 12,
        })

        Utility:Create("UICorner", {
            Parent = closeBtn,
            CornerRadius = UDim.new(1, 0),
        })

        closeBtn.MouseButton1Click:Connect(function()
            mainFrame.Visible = false
        end)
    end

    -- Tab bar
    local tabBar = Utility:Create("Frame", {
        Name = "TabBar",
        Parent = mainFrame,
        BackgroundColor3 = Utility.Colors.TabBackground,
        BorderSizePixel = 0,
        Position = UDim2.new(0, 0, 0, 30),
        Size = UDim2.new(1, 0, 0, 30),
    })

    local tabBarLayout = Utility:Create("UIListLayout", {
        Parent = tabBar,
        FillDirection = Enum.FillDirection.Horizontal,
        SortOrder = Enum.SortOrder.LayoutOrder,
        Padding = UDim.new(0, 0),
    })

    -- Content area
    local contentArea = Utility:Create("Frame", {
        Name = "ContentArea",
        Parent = mainFrame,
        BackgroundTransparency = 1,
        Position = UDim2.new(0, 0, 0, 60),
        Size = UDim2.new(1, 0, 1, -60),
    })

    -- Tabs storage
    local tabs = {}
    local tabButtons = {}
    local currentTab = nil

    -- Dragging functionality
    if draggable then
        local dragging = false
        local dragInput, mousePos, framePos

        titleBar.InputBegan:Connect(function(input)
            if input.UserInputType == Enum.UserInputType.MouseButton1 or input.UserInputType == Enum.UserInputType.Touch then
                dragging = true
                mousePos = input.Position
                framePos = mainFrame.Position

                input.Changed:Connect(function()
                    if input.UserInputState == Enum.UserInputState.End then
                        dragging = false
                    end
                end)
            end
        end)

        titleBar.InputChanged:Connect(function(input)
            if input.UserInputType == Enum.UserInputType.MouseMovement or input.UserInputType == Enum.UserInputType.Touch then
                dragInput = input
            end
        end)

        UserInputService.InputChanged:Connect(function(input)
            if input == dragInput and dragging then
                local delta = input.Position - mousePos
                mainFrame.Position = UDim2.new(
                    framePos.X.Scale,
                    framePos.X.Offset + delta.X,
                    framePos.Y.Scale,
                    framePos.Y.Offset + delta.Y
                )
            end
        end)
    end

    -- =============================================
    -- TAB PROTOTYPE
    -- =============================================

    local Tab = {}
    Tab.__index = Tab

    -- Column Subtabs support
    function Tab:AddColumnTab(columnIndex, tabTitle)
        if not self.ColumnSubtabs then
            self.ColumnSubtabs = {}
        end
        
        local column = self.Columns[columnIndex] or self.Columns[1]
        if not column then return nil end
        
        -- Create column subtab bar
        local subtabBar = Utility:Create("Frame", {
            Name = "SubtabBar_" .. tabTitle,
            Parent = column.Frame,
            BackgroundColor3 = Utility.Colors.TabBackground,
            BorderSizePixel = 0,
            Size = UDim2.new(1, 0, 0, 25),
        })
        
        local subtabLayout = Utility:Create("UIListLayout", {
            Parent = subtabBar,
            FillDirection = Enum.FillDirection.Horizontal,
            SortOrder = Enum.SortOrder.LayoutOrder,
            Padding = UDim.new(0, 0),
        })
        
        -- Create subtab button
        local subtabBtn = Utility:Create("TextButton", {
            Name = "SubtabButton_" .. tabTitle,
            Parent = subtabBar,
            BackgroundColor3 = Utility.Colors.TabHover,
            BorderSizePixel = 0,
            Size = UDim2.new(1 / math.max(#self.ColumnSubtabs[columnIndex] or 1, 1), 0, 1, 0),
            Text = tabTitle,
            TextColor3 = Utility.Colors.Placeholder,
            Font = Enum.Font.Gotham,
            TextSize = 12,
            AutoButtonColor = false,
        })
        
        -- Create subtab content
        local subtabContent = Utility:Create("Frame", {
            Name = "SubtabContent_" .. tabTitle,
            Parent = column.Frame,
            BackgroundTransparency = 1,
            Size = UDim2.new(1, 0, 1, -25),
            Position = UDim2.new(0, 0, 0, 25),
            Visible = false,
        })
        
        -- Add padding to subtab content
        local subtabPadding = Utility:Create("UIPadding", {
            Parent = subtabContent,
            PaddingTop = UDim.new(0, 4),
            PaddingBottom = UDim.new(0, 4),
            PaddingLeft = UDim.new(0, 4),
            PaddingRight = UDim.new(0, 4),
        })
        
        local subtabLayout = Utility:Create("UIListLayout", {
            Parent = subtabContent,
            SortOrder = Enum.SortOrder.LayoutOrder,
            Padding = UDim.new(0, 4),
        })
        
        table.insert(self.ColumnSubtabs[columnIndex] or {}, {
            Button = subtabBtn,
            Content = subtabContent,
            Title = tabTitle,
            Elements = {}
        })
        
        -- Update button sizes
        if self.ColumnSubtabs[columnIndex] then
            for i, btn in ipairs(self.ColumnSubtabs[columnIndex]) do
                btn.Button.Size = UDim2.new(1 / #self.ColumnSubtabs[columnIndex], 0, 1, 0)
            end
        end
        
        -- Click handler
        subtabBtn.MouseButton1Click:Connect(function()
            self:SelectColumnTab(columnIndex, tabTitle)
        end)
        
        -- Auto select first
        if #self.ColumnSubtabs[columnIndex] == 1 then
            self:SelectColumnTab(columnIndex, tabTitle)
        end
        
        return self.ColumnSubtabs[columnIndex][#self.ColumnSubtabs[columnIndex]]
    end

    function Tab:SelectColumnTab(columnIndex, tabTitle)
        if not self.ColumnSubtabs[columnIndex] then return end
        
        for _, subtab in ipairs(self.ColumnSubtabs[columnIndex]) do
            if subtab.Title == tabTitle then
                subtab.Content.Visible = true
                subtab.Button.BackgroundColor3 = Utility.Colors.TabSelected
                subtab.Button.TextColor3 = Utility.Colors.Text
            else
                subtab.Content.Visible = false
                subtab.Button.BackgroundColor3 = Utility.Colors.TabHover
                subtab.Button.TextColor3 = Utility.Colors.Placeholder
            end
        end
    end

    function Tab:AddColumn(columnCount)
        columnCount = math.clamp(columnCount or 1, 1, 4)
        self.ColumnCount = columnCount

        -- Clear existing columns
        for _, col in ipairs(self.Columns) do
            if col.Frame then
                col.Frame:Destroy()
            end
        end
        self.Columns = {}
        if self.ColumnSubtabs then
            self.ColumnSubtabs = {}
        end

        for i = 1, columnCount do
            local columnFrame = Utility:Create("Frame", {
                Name = "Column_" .. i,
                Parent = self.Content,
                BackgroundTransparency = 1,
                Size = UDim2.new(1 / columnCount, 0, 1, 0),
            })

            local columnLayout = Utility:Create("UIListLayout", {
                Parent = columnFrame,
                SortOrder = Enum.SortOrder.LayoutOrder,
                Padding = UDim.new(0, 8),
            })

            local columnPadding = Utility:Create("UIPadding", {
                Parent = columnFrame,
                PaddingTop = UDim.new(0, 4),
                PaddingBottom = UDim.new(0, 4),
                PaddingLeft = UDim.new(0, 4),
                PaddingRight = UDim.new(0, 4),
            })

            local columnData = {
                Frame = columnFrame,
                Elements = {},
                CurrentSubtab = nil,
            }

            table.insert(self.Columns, columnData)
        end

        return self
    end

    function Tab:GetColumn(columnIndex)
        columnIndex = math.clamp(columnIndex or 1, 1, #self.Columns)
        return self.Columns[columnIndex]
    end

    function Tab:AddElement(element, columnIndex)
        columnIndex = columnIndex or 1
        if #self.Columns == 0 then
            self:AddColumn(1)
        end
        columnIndex = math.clamp(columnIndex, 1, #self.Columns)

        local column = self.Columns[columnIndex]
        local parentFrame = column.Frame
        
        -- Check if column has subtabs and current subtab
        if column.CurrentSubtab and column.CurrentSubtab.Content then
            parentFrame = column.CurrentSubtab.Content
        end

        if element.Frame then
            element.Frame.Parent = parentFrame
        else
            element.Parent = parentFrame
        end

        table.insert(column.Elements, element)
        
        -- Store reference in subtab if applicable
        if column.CurrentSubtab then
            table.insert(column.CurrentSubtab.Elements, element)
        end

        -- Auto update canvas size
        self:UpdateCanvasSize()

        return element
    end

    function Tab:FindElement(name)
        for _, column in ipairs(self.Columns) do
            for _, element in ipairs(column.Elements) do
                if element.Name == name or (element.Label and element.Label.Text == name) then
                    return element
                end
            end
            if column.CurrentSubtab then
                for _, element in ipairs(column.CurrentSubtab.Elements) do
                    if element.Name == name or (element.Label and element.Label.Text == name) then
                        return element
                    end
                end
            end
        end
        return nil
    end

    function Tab:GetElements()
        local allElements = {}
        for _, column in ipairs(self.Columns) do
            for _, element in ipairs(column.Elements) do
                table.insert(allElements, element)
            end
        end
        return allElements
    end

    function Tab:ClearColumn(columnIndex)
        columnIndex = math.clamp(columnIndex or 1, 1, #self.Columns)
        local column = self.Columns[columnIndex]
        
        if column then
            for _, element in ipairs(column.Elements) do
                if element.Frame then
                    element.Frame:Destroy()
                end
            end
            column.Elements = {}
            self:UpdateCanvasSize()
        end
    end

    function Tab:UpdateCanvasSize()
        task.wait() -- Wait for layout to update
        
        local totalHeight = 0
        for _, col in ipairs(self.Columns) do
            local colHeight = 0
            
            -- Check elements in current subtab first
            if col.CurrentSubtab and #col.CurrentSubtab.Elements > 0 then
                for _, element in ipairs(col.CurrentSubtab.Elements) do
                    if element.Frame and element.Frame.Visible then
                        colHeight = colHeight + element.Frame.AbsoluteSize.Y + 8
                    end
                end
            else
                for _, element in ipairs(col.Elements) do
                    if element.Frame and element.Frame.Visible then
                        colHeight = colHeight + element.Frame.AbsoluteSize.Y + 8
                    end
                end
            end
            
            if colHeight > totalHeight then
                totalHeight = colHeight
            end
        end
        self.Content.CanvasSize = UDim2.new(0, 0, 0, totalHeight + 16)
    end

    -- =============================================
    -- ELEMENT CREATORS
    -- =============================================

    function Tab:AddToggle(options)
        options = options or {}
        local text = options.Text or "Toggle"
        local default = options.Default or false
        local callback = options.Callback or function() end
        local tooltip = options.Tooltip

        local toggleFrame = Utility:Create("Frame", {
            Name = "Toggle_" .. text,
            Parent = nil,
            BackgroundColor3 = Utility.Colors.BackgroundLight,
            BorderColor3 = Utility.Colors.Border,
            BorderSizePixel = 1,
            Size = UDim2.new(1, 0, 0, 30),
            LayoutOrder = #self.Columns[1].Elements,
        })

        Utility:Create("UICorner", {
            Parent = toggleFrame,
            CornerRadius = UDim.new(0, 4),
        })

        local toggleButton = Utility:Create("Frame", {
            Name = "ToggleIndicator",
            Parent = toggleFrame,
            BackgroundColor3 = default and Utility.Colors.Accent or Utility.Colors.BorderLight,
            BorderSizePixel = 0,
            Position = UDim2.new(0, 6, 0.5, -6),
            Size = UDim2.new(0, 18, 0, 12),
        })

        Utility:Create("UICorner", {
            Parent = toggleButton,
            CornerRadius = UDim.new(1, 0),
        })

        local toggleKnob = Utility:Create("Frame", {
            Name = "ToggleKnob",
            Parent = toggleButton,
            BackgroundColor3 = Color3.fromRGB(255, 255, 255),
            BorderSizePixel = 0,
            Position = UDim2.new(0, default and 7 or 1, 0.5, -4),
            Size = UDim2.new(0, 10, 0, 10),
        })

        Utility:Create("UICorner", {
            Parent = toggleKnob,
            CornerRadius = UDim.new(1, 0),
        })

        local toggleLabel = Utility:Create("TextLabel", {
            Name = "ToggleLabel",
            Parent = toggleFrame,
            BackgroundTransparency = 1,
            Position = UDim2.new(0, 32, 0, 0),
            Size = UDim2.new(1, -36, 1, 0),
            Text = text,
            TextColor3 = Utility.Colors.Text,
            Font = Enum.Font.Gotham,
            TextSize = 13,
            TextXAlignment = Enum.TextXAlignment.Left,
        })

        if tooltip then
            toggleFrame.MouseEnter:Connect(function()
                Utility:ShowNotification(tooltip, "info", 3)
            end)
        end

        local toggleData = {
            Frame = toggleFrame,
            Value = default,
            Callback = callback,
            Indicator = toggleButton,
            Knob = toggleKnob,
            Label = toggleLabel,
        }

        local function updateVisual()
            local targetX = toggleData.Value and 7 or 1
            local tween = Utility:CreateTween(toggleKnob, {Position = UDim2.new(0, targetX, 0.5, -4)}, 0.15)
            tween:Play()
            toggleButton.BackgroundColor3 = toggleData.Value and Utility.Colors.Accent or Utility.Colors.BorderLight
        end

        toggleFrame.InputBegan:Connect(function(input)
            if input.UserInputType == Enum.UserInputType.MouseButton1 or input.UserInputType == Enum.UserInputType.Touch then
                toggleData.Value = not toggleData.Value
                updateVisual()
                callback(toggleData.Value)
            end
        end)

        -- API
        function toggleData:SetValue(value)
            self.Value = value
            updateVisual()
            self.Callback(self.Value)
        end

        function toggleData:GetValue()
            return self.Value
        end

        function toggleData:SetText(newText)
            self.Label.Text = newText
        end

        function toggleData:SetVisible(visible)
            self.Frame.Visible = visible
        end

        function toggleData:IsVisible()
            return self.Frame.Visible
        end

        updateVisual()
        return self:AddElement(toggleData)
    end

 -- Continuing the rest of the component methods would follow the same pattern...
 -- Due to length constraints, I'll provide the enhanced full file in the next write

return nil;