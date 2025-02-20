import {
    keyframes,
    trigger,
    state,
    style,
    animate,
    transition,
    query,
    stagger,
} from '@angular/animations';

export const slideTopbar = trigger('slideTopbar', [
    state('hidden', style({ transform: 'translateY(-100%)' })), // Topbar ausgeblendet
    state('visible', style({ transform: 'translateY(0)' })), // Topbar eingeblendet
    transition('hidden <=> visible', [animate('300ms ease-in-out')]),
]);

export const slideFooter = trigger('slideFooter', [
    state('hidden', style({ transform: 'translateY(100%)' })),
    state('visible', style({ transform: 'translateY(0)' })),
    transition('hidden <=> visible', [animate('300ms ease-in-out')]),
]);

export const alertAnimation = trigger('pulseAnimation', [
    transition(':enter', [
        animate(
            '0.5s ease-in-out',
            keyframes([
                style({ transform: 'scale(0)', opacity: 0, offset: 0 }),
                style({ transform: 'scale(1.1)', opacity: 1, offset: 0.5 }),
                style({ transform: 'scale(1)', opacity: 1, offset: 1 }),
            ])
        ),
    ]),
    transition(':leave', [
        animate(
            '0.5s ease-in-out',
            keyframes([
                style({ transform: 'scale(1)', opacity: 1, offset: 0 }),
                style({ transform: 'scale(1.1)', opacity: 0.5, offset: 0.5 }),
                style({ transform: 'scale(0)', opacity: 0, offset: 1 }),
            ])
        ),
    ]),
]);

export const tourCardsSlideIn = trigger('tourCardsAnimation', [
    transition(':enter', [
        query('app-tour-card', [
            style({ transform: 'translateY(30px)', opacity: 0 }),
            stagger(150, [
                animate(
                    '0.5s ease-out',
                    style({ transform: 'translateY(0)', opacity: 1 })
                ),
            ]),
        ]),
    ]),
]);

export const tableRowAnimation = trigger('tableRowAnimation', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translateY(20px)' }),
      animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
    ]),
  ]);
