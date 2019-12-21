function [times, populations] = ...
    directMethod(stoichiometric_matrix, timespan, initial_population, probabilities)
    
    endtime = timespan(2);
    times(1) = timespan(1);
    populations = initial_population;
    index = 1;
    
    while times(index) < endtime
        as = get_propensities(probabilities, populations(index, :)');
        
        random = rand(1,2);
        
        % Sample next time a reaction is going to happen (tau)
        a0 = sum(as);
        tau = (1 / a0) * log(1 / random(1));

        % Which reaction should we choose?
        mu = 1;
        sum_as = as(1);
        while sum_as < random(2) * a0
          mu = mu + 1;
          sum_as = sum_as + as(mu);
        end
        

        % Update time and carry out reaction mu
        times(index + 1) = times(index) + tau;
        populations(index + 1, :) = ...
            populations(index, :) + stoichiometric_matrix(mu, :);
        
        index = index + 1;
    end
end

% Hmu = number of combination. Cmu: probability for each reaction to happen.
% Get Hs are calculated from Xs. Get As from current Hs and Cs.
function [propensities] = ...
    get_propensities(initial_propensities, populations)
    
    Ca = initial_propensities(1) * populations(1) * populations(2);
    Cb = initial_propensities(2) * populations(1) * populations(3);
    Cc = initial_propensities(3) * populations(2) * populations(3);
    
    propensities = [Ca; Cb; Cc]; 
    

end