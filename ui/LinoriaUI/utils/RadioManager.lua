-- Radio Manager for Linoria UI
-- Manages radio toggle groups to ensure only one is selected per group

local RadioManager = {}
RadioManager.__index = RadioManager

-- Store groups and their selected radios
local groups = setmetatable({}, {__mode = "k"}) -- Weak keys to avoid memory leaks

function RadioManager:NotifyGroupChange(group, radio)
    -- If this radio is being selected, deselect others in the same group
    if radio:GetValue() then
        if groups[group] then
            for _, otherRadio in ipairs(groups[group]) do
                if otherRadio ~= radio and otherRadio:GetValue() then
                    otherRadio:SetValue(false)
                end
            end
        end
        
        -- Store this radio in the group
        if not groups[group] then
            groups[group] = {}
        end
        
        -- Add radio to group if not already present
        local exists = false
        for _, r in ipairs(groups[group]) do
            if r == radio then
                exists = true
                break
            end
        end
        
        if not exists then
            table.insert(groups[group], radio)
        end
    end
end

function RadioManager:GetGroupRadios(group)
    return groups[group] or {}
end

function RadioManager:ClearGroup(group)
    groups[group] = nil
end

return RadioManager