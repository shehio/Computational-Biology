%% Part One.
i = 0;
while i < 10
    stoichiometric_matrix = [1  -1 0 ; -1 0 1 ; 0 1 -1];
    timespan = [0 40];
    initial_population = [200 300 500];
    probabilities = [0.001 ; 0.001 ; 0.001];
    [ts, pops] = gillespie(...
                    stoichiometric_matrix,...
                    timespan,...
                    initial_population,...
                    probabilities);
    hold on;
    plot(ts, pops(:, 2))
    i = i + 1;
end



%% Part Two.
% i = 1;
% while i < 10
%     stoichiometric_matrix = [1  -1 0 ; -1 0 1 ; 0 1 -1];
%     timespan = [0 40];
%     initial_population = 50 * [200 300 500];
%     probabilities = 0.02 * [0.001 ; 0.001 ; 0.001];
%     [ts, pops] = gillespie(...
%                     stoichiometric_matrix,...
%                     timespan,...
%                     initial_population,...
%                     probabilities);
%     hold on;
%     plot(ts, pops(:, 2))
%     i = i + 1;
% end


