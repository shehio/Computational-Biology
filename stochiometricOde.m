t0 = 0
t_max = 40

k1 = 0.001;
k2 = 0.001;
k3 = 0.001;

a = 200
b = 300
c = 500

t = linspace(t0, t_max, 1001);

y0 = [a ; b ; c];

[t, y] = ode45(@dydt, [t0 t_max], y0);

hold on
plot(t, y(:, 1))
plot(t, y(:, 2))
plot(t, y(:, 3))
legend({'Population A', 'Population B', 'Population C'},...
    'Location','northwest','NumColumns',1)


% legend({'ode solution'},'Location','northwest','NumColumns',1)

function ys = dydt(t, y)
    ys = [K1(y(1), y(2)) - K2(y(1), y(3));...
         K3(y(2), y(3)) - K1(y(1), y(2));...
         K2(y(1), y(3)) - K3(y(2), y(3))]
end          


function K = K1(Ca, Cb)
    k1 = 0.001;
    K = k1 * Ca * Cb;
end

function K = K2(Ca, Cc)
    k2 = 0.001;
    K = k2 * Ca * Cc;
end

function K = K3(Cb, Cc)
    k3 = 0.001;
    K = k3 * Cb * Cc;
end